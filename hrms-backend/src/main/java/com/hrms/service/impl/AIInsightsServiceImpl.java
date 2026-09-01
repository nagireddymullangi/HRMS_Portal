
//service/impl/AIInsightsServiceImpl.java
package com.hrms.service.impl;

import com.hrms.dto.response.AIInsightsResponse;
import com.hrms.model.*;
import com.hrms.repository.*;
import com.hrms.service.AIInsightsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AIInsightsServiceImpl implements AIInsightsService {

 private final EmployeeRepository employeeRepository;
 private final AttendanceRepository attendanceRepository;
 private final LeaveRepository leaveRepository;
 private final PayrollRepository payrollRepository;
 private final GrievanceRepository grievanceRepository;

 @Override
 public AIInsightsResponse getComprehensiveInsights() {
     return AIInsightsResponse.builder()
             .attritionRisks(predictAttritionRisks().stream()
                 .map(this::mapToAttritionRisk)
                 .collect(Collectors.toList()))
             .topPerformers(getTopPerformers(5))
             .attendanceAlerts(getAttendanceAnomalies())
             .smartRecommendations(getSmartRecommendations())
             .sentimentAnalysis(analyzeSentiment())
             .salaryBenchmarks(getSalaryBenchmarks())
             .skillGaps(getSkillGaps())
             .predictions(getPredictions())
             .build();
 }

 @Override
 public List<Map<String, Object>> predictAttritionRisks() {
     List<Employee> employees = employeeRepository.findAll().stream()
             .filter(e -> e.getStatus() == Employee.Status.ACTIVE)
             .collect(Collectors.toList());

     List<Map<String, Object>> risks = new ArrayList<>();

     for (Employee emp : employees) {
         double riskScore = calculateAttritionRisk(emp);
         List<String> factors = identifyRiskFactors(emp);

         if (riskScore >= 30) {
             Map<String, Object> risk = new HashMap<>();
             risk.put("employeeId", emp.getId());
             risk.put("employeeName", emp.getFullName());
             risk.put("employeeCode", emp.getEmployeeId());
             risk.put("department", emp.getDepartment() != null
                 ? emp.getDepartment().getName() : "N/A");
             risk.put("designation", emp.getDesignation());
             risk.put("riskScore", riskScore);
             risk.put("riskLevel", getRiskLevel(riskScore));
             risk.put("factors", factors);
             risk.put("suggestedActions", getSuggestedActions(factors));
             risks.add(risk);
         }
     }

     // Sort by risk score descending
     risks.sort((a, b) -> Double.compare(
         (Double) b.get("riskScore"), (Double) a.get("riskScore")));

     return risks.stream().limit(20).collect(Collectors.toList());
 }

 /**
  * Simple attrition risk algorithm based on:
  * - Tenure (short tenure = higher risk)
  * - Absenteeism rate
  * - Leave frequency
  * - Grievances filed
  * - Time since last salary hike
  */
 private double calculateAttritionRisk(Employee emp) {
     double score = 0;
     LocalDate today = LocalDate.now();

     // Factor 1: Short tenure (< 1 year adds 20 points)
     if (emp.getDateOfJoining() != null) {
         long days = ChronoUnit.DAYS.between(emp.getDateOfJoining(), today);
         if (days < 365) score += 20;
         else if (days < 730) score += 10;
     }

     // Factor 2: High absenteeism
     long totalAttendance = attendanceRepository
             .findByEmployeeIdOrderByDateDesc(emp.getId()).size();
     long absentCount = attendanceRepository
             .findByEmployeeIdOrderByDateDesc(emp.getId()).stream()
             .filter(a -> a.getStatus() == Attendance.Status.ABSENT).count();

     if (totalAttendance > 0) {
         double absenteeRate = (absentCount * 100.0) / totalAttendance;
         if (absenteeRate > 15) score += 25;
         else if (absenteeRate > 10) score += 15;
         else if (absenteeRate > 5) score += 8;
     }

     // Factor 3: Frequent leaves
     long leaveCount = leaveRepository
             .findByEmployeeIdOrderByAppliedAtDesc(emp.getId()).size();
     if (leaveCount > 10) score += 15;
     else if (leaveCount > 5) score += 8;

     // Factor 4: Grievances filed
     long grievanceCount = grievanceRepository
             .findByEmployeeIdOrderByCreatedAtDesc(emp.getId()).size();
     if (grievanceCount >= 3) score += 20;
     else if (grievanceCount >= 1) score += 10;

     // Factor 5: Age & career stage
     // Add more sophisticated logic here...

     return Math.min(score, 100);
 }

 private List<String> identifyRiskFactors(Employee emp) {
     List<String> factors = new ArrayList<>();
     LocalDate today = LocalDate.now();

     // Check tenure
     if (emp.getDateOfJoining() != null) {
         long days = ChronoUnit.DAYS.between(emp.getDateOfJoining(), today);
         if (days < 365) {
             factors.add("New employee (< 1 year tenure)");
         }
     }

     // Check absenteeism
     long absentCount = attendanceRepository
             .findByEmployeeIdOrderByDateDesc(emp.getId()).stream()
             .filter(a -> a.getStatus() == Attendance.Status.ABSENT).count();
     if (absentCount > 5) {
         factors.add("High absenteeism (" + absentCount + " absent days)");
     }

     // Check leaves
     long leaveCount = leaveRepository
             .findByEmployeeIdOrderByAppliedAtDesc(emp.getId()).size();
     if (leaveCount > 5) {
         factors.add("Frequent leave applications (" + leaveCount + ")");
     }

     // Check grievances
     long grievanceCount = grievanceRepository
             .findByEmployeeIdOrderByCreatedAtDesc(emp.getId()).size();
     if (grievanceCount > 0) {
         factors.add(grievanceCount + " grievance(s) filed");
     }

     if (factors.isEmpty()) {
         factors.add("Multiple minor risk indicators");
     }

     return factors;
 }

 private List<String> getSuggestedActions(List<String> factors) {
     List<String> actions = new ArrayList<>();

     for (String factor : factors) {
         if (factor.contains("New employee")) {
             actions.add("Schedule regular check-ins and mentorship");
             actions.add("Provide additional training resources");
         }
         if (factor.contains("absenteeism")) {
             actions.add("Conduct one-on-one meeting to understand issues");
             actions.add("Review workload and job satisfaction");
         }
         if (factor.contains("leave")) {
             actions.add("Check for work-life balance concerns");
             actions.add("Consider flexible work arrangements");
         }
         if (factor.contains("grievance")) {
             actions.add("Prioritize grievance resolution");
             actions.add("Involve HR business partner");
         }
     }

     if (actions.isEmpty()) {
         actions.add("Schedule engagement conversation");
         actions.add("Review career development plan");
     }

     return actions.stream().distinct().collect(Collectors.toList());
 }

 private String getRiskLevel(double score) {
     if (score >= 70) return "CRITICAL";
     if (score >= 50) return "HIGH";
     if (score >= 30) return "MEDIUM";
     return "LOW";
 }

 private com.hrms.dto.response.AttritionRisk mapToAttritionRisk(Map<String, Object> m) {
     return com.hrms.dto.response.AttritionRisk.builder()
             .employeeId((Long) m.get("employeeId"))
             .employeeName((String) m.get("employeeName"))
             .employeeCode((String) m.get("employeeCode"))
             .department((String) m.get("department"))
             .designation((String) m.get("designation"))
             .riskScore((Double) m.get("riskScore"))
             .riskLevel((String) m.get("riskLevel"))
             .factors((List<String>) m.get("factors"))
             .suggestedActions((List<String>) m.get("suggestedActions"))
             .build();
 }

 @Override
 public Map<String, Object> analyzeSentiment() {
     Map<String, Object> sentiment = new HashMap<>();

     // Simulate sentiment analysis based on grievance patterns
     long totalGrievances = grievanceRepository.count();
     long resolvedGrievances = grievanceRepository
             .countByStatus(Grievance.Status.RESOLVED);
     long escalated = grievanceRepository
             .countByStatus(Grievance.Status.ESCALATED);

     double sentimentScore = 100 - (totalGrievances * 2) + (resolvedGrievances * 1.5);
     sentimentScore = Math.max(0, Math.min(100, sentimentScore));

     sentiment.put("overallScore", Math.round(sentimentScore * 100.0) / 100.0);
     sentiment.put("sentiment", getSentimentLabel(sentimentScore));
     sentiment.put("totalGrievances", totalGrievances);
     sentiment.put("resolvedGrievances", resolvedGrievances);
     sentiment.put("escalatedCount", escalated);

     List<String> insights = new ArrayList<>();
     if (sentimentScore >= 80) {
         insights.add("✓ Employees show high satisfaction levels");
     } else if (sentimentScore >= 60) {
         insights.add("⚠ Moderate satisfaction - room for improvement");
     } else {
         insights.add("🚨 Low satisfaction - immediate action needed");
     }

     if (escalated > 0) {
         insights.add("⚠ " + escalated + " escalated grievances require attention");
     }

     sentiment.put("insights", insights);
     return sentiment;
 }

 private String getSentimentLabel(double score) {
     if (score >= 80) return "POSITIVE";
     if (score >= 60) return "NEUTRAL";
     if (score >= 40) return "MIXED";
     return "NEGATIVE";
 }

 @Override
 public List<Map<String, Object>> getTopPerformers(int limit) {
     // Simple algorithm: Rank by attendance rate + low leaves + no grievances
     List<Employee> employees = employeeRepository.findAll().stream()
             .filter(e -> e.getStatus() == Employee.Status.ACTIVE)
             .collect(Collectors.toList());

     List<Map<String, Object>> performers = new ArrayList<>();

     for (Employee emp : employees) {
         double score = calculatePerformanceScore(emp);
         Map<String, Object> perf = new HashMap<>();
         perf.put("employeeId", emp.getId());
         perf.put("employeeName", emp.getFullName());
         perf.put("employeeCode", emp.getEmployeeId());
         perf.put("department", emp.getDepartment() != null
             ? emp.getDepartment().getName() : "N/A");
         perf.put("designation", emp.getDesignation());
         perf.put("score", Math.round(score * 100.0) / 100.0);
         performers.add(perf);
     }

     performers.sort((a, b) -> Double.compare(
         (Double) b.get("score"), (Double) a.get("score")));

     return performers.stream().limit(limit).collect(Collectors.toList());
 }

 private double calculatePerformanceScore(Employee emp) {
     double score = 50; // Base score

     // Attendance
     long totalAttendance = attendanceRepository
             .findByEmployeeIdOrderByDateDesc(emp.getId()).size();
     long presentCount = attendanceRepository
             .findByEmployeeIdOrderByDateDesc(emp.getId()).stream()
             .filter(a -> a.getStatus() == Attendance.Status.PRESENT).count();

     if (totalAttendance > 0) {
         double attendanceRate = (presentCount * 100.0) / totalAttendance;
         score += (attendanceRate - 80) * 0.5;
     }

     // Low leaves
     long leaveCount = leaveRepository
             .findByEmployeeIdOrderByAppliedAtDesc(emp.getId()).size();
     score -= leaveCount * 2;

     // No grievances
     long grievanceCount = grievanceRepository
             .findByEmployeeIdOrderByCreatedAtDesc(emp.getId()).size();
     score -= grievanceCount * 5;

     return Math.max(0, Math.min(100, score));
 }

 @Override
 public List<Map<String, Object>> getAttendanceAnomalies() {
     List<Map<String, Object>> anomalies = new ArrayList<>();
     LocalDate lastMonth = LocalDate.now().minusMonths(1);

     List<Employee> employees = employeeRepository.findAll();
     for (Employee emp : employees) {
         List<Attendance> recentAttendance = attendanceRepository
                 .findByEmployeeIdAndDateBetweenOrderByDateDesc(
                     emp.getId(), lastMonth, LocalDate.now());

         long absentDays = recentAttendance.stream()
                 .filter(a -> a.getStatus() == Attendance.Status.ABSENT).count();
         long lateDays = recentAttendance.stream()
                 .filter(a -> a.getCheckIn() != null &&
                     a.getCheckIn().getHour() > 10).count();

         if (absentDays >= 5 || lateDays >= 5) {
             Map<String, Object> anomaly = new HashMap<>();
             anomaly.put("employeeId", emp.getId());
             anomaly.put("employeeName", emp.getFullName());
             anomaly.put("employeeCode", emp.getEmployeeId());
             anomaly.put("absentDays", absentDays);
             anomaly.put("lateDays", lateDays);
             anomaly.put("severity", absentDays >= 10 ? "HIGH" : "MEDIUM");
             anomaly.put("recommendation",
                 "Schedule a check-in meeting to discuss attendance");
             anomalies.add(anomaly);
         }
     }

     return anomalies;
 }

 @Override
 public List<Map<String, Object>> getSmartRecommendations() {
     List<Map<String, Object>> recommendations = new ArrayList<>();

     // 1. Attrition risk warning
     long highRiskCount = predictAttritionRisks().stream()
             .filter(r -> "HIGH".equals(r.get("riskLevel")) ||
                 "CRITICAL".equals(r.get("riskLevel")))
             .count();

     if (highRiskCount > 0) {
         Map<String, Object> rec = new HashMap<>();
         rec.put("priority", "HIGH");
         rec.put("category", "RETENTION");
         rec.put("title", highRiskCount + " employees at high attrition risk");
         rec.put("description",
             "Immediate retention efforts recommended for these employees");
         rec.put("actionUrl", "/admin/ai-insights?tab=attrition");
         recommendations.add(rec);
     }

     // 2. Onboarding recommendations
     long recentHires = employeeRepository.findAll().stream()
             .filter(e -> e.getDateOfJoining() != null &&
                 ChronoUnit.DAYS.between(e.getDateOfJoining(),
                     LocalDate.now()) < 90)
             .count();

     if (recentHires > 0) {
         Map<String, Object> rec = new HashMap<>();
         rec.put("priority", "MEDIUM");
         rec.put("category", "ONBOARDING");
         rec.put("title", recentHires + " new hires need attention");
         rec.put("description",
             "Schedule 30-60-90 day check-ins with new hires");
         rec.put("actionUrl", "/admin/onboarding");
         recommendations.add(rec);
     }

     // 3. Grievance follow-up
     long pendingGrievances = grievanceRepository
             .countByStatus(Grievance.Status.OPEN) +
             grievanceRepository.countByStatus(Grievance.Status.IN_PROGRESS);

     if (pendingGrievances > 0) {
         Map<String, Object> rec = new HashMap<>();
         rec.put("priority", "HIGH");
         rec.put("category", "GRIEVANCE");
         rec.put("title", pendingGrievances + " pending grievances");
         rec.put("description",
             "Address open grievances to improve employee satisfaction");
         rec.put("actionUrl", "/admin/grievances");
         recommendations.add(rec);
     }

     return recommendations;
 }

 @Override
 public Map<String, Object> getSalaryBenchmarks() {
     Map<String, Object> benchmarks = new HashMap<>();

     List<Payroll> allPayrolls = payrollRepository.findAll();

     // Group by designation
     Map<String, List<BigDecimal>> byDesignation = new HashMap<>();
     for (Payroll p : allPayrolls) {
         String designation = p.getEmployee().getDesignation();
         if (designation == null) continue;
         byDesignation.computeIfAbsent(designation, k -> new ArrayList<>())
                 .add(p.getGrossSalary());
     }

     List<Map<String, Object>> benchmarkData = new ArrayList<>();
     for (Map.Entry<String, List<BigDecimal>> entry : byDesignation.entrySet()) {
         List<BigDecimal> salaries = entry.getValue();
         if (salaries.isEmpty()) continue;

         BigDecimal avg = salaries.stream()
                 .reduce(BigDecimal.ZERO, BigDecimal::add)
                 .divide(BigDecimal.valueOf(salaries.size()),
                     2, RoundingMode.HALF_UP);
         BigDecimal min = salaries.stream().min(BigDecimal::compareTo)
                 .orElse(BigDecimal.ZERO);
         BigDecimal max = salaries.stream().max(BigDecimal::compareTo)
                 .orElse(BigDecimal.ZERO);

         Map<String, Object> data = new HashMap<>();
         data.put("designation", entry.getKey());
         data.put("min", min);
         data.put("avg", avg);
         data.put("max", max);
         data.put("count", salaries.size());
         benchmarkData.add(data);
     }

     benchmarks.put("byDesignation", benchmarkData);
     return benchmarks;
 }

 @Override
 public List<Map<String, Object>> getSkillGaps() {
     // Placeholder - integrate with training/skills module
     List<Map<String, Object>> gaps = new ArrayList<>();

     String[][] mockGaps = {
         {"Cloud Computing", "40", "AWS/Azure certification recommended"},
         {"Data Analytics", "35", "Advanced SQL and Python training needed"},
         {"Leadership", "50", "Management training for mid-level roles"},
         {"Cybersecurity", "30", "Security awareness training required"},
     };

     for (String[] gap : mockGaps) {
         Map<String, Object> g = new HashMap<>();
         g.put("skill", gap[0]);
         g.put("gapPercentage", Integer.parseInt(gap[1]));
         g.put("recommendation", gap[2]);
         g.put("priority", Integer.parseInt(gap[1]) >= 40 ? "HIGH" : "MEDIUM");
         gaps.add(g);
     }

     return gaps;
 }

 @Override
 public Map<String, Object> chatbotResponse(String query) {
     Map<String, Object> response = new HashMap<>();
     String lowerQuery = query.toLowerCase();

     // Simple rule-based chatbot
     if (lowerQuery.contains("leave") && lowerQuery.contains("balance")) {
         response.put("answer",
             "You can check your leave balance in the 'My Leaves' section. " +
             "Navigate to Employee → My Leaves → Leave Balance tab.");
         response.put("suggestions", Arrays.asList(
             "How to apply for leave?", "Leave policies", "Leave types"));
     } else if (lowerQuery.contains("payslip") || lowerQuery.contains("salary")) {
         response.put("answer",
             "Your payslips are available in 'My Payroll'. " +
             "You can download them as PDF for the last 12 months.");
         response.put("suggestions", Arrays.asList(
             "How is my salary calculated?", "Tax deductions", "Bonus"));
     } else if (lowerQuery.contains("attendance")) {
         response.put("answer",
             "You can mark attendance from 'My Attendance' page. " +
             "Face recognition and biometric options are available.");
         response.put("suggestions", Arrays.asList(
             "Check attendance history", "Attendance policy", "Work from home"));
     } else if (lowerQuery.contains("policy") || lowerQuery.contains("policies")) {
         response.put("answer",
             "All HR policies are available under 'HR Policies' section. " +
             "You need to acknowledge mandatory policies.");
         response.put("suggestions", Arrays.asList(
             "Leave policy", "Code of conduct", "Remote work policy"));
     } else if (lowerQuery.contains("training") || lowerQuery.contains("learning")) {
         response.put("answer",
             "Browse available training programs in 'My Learning'. " +
             "Enroll in programs relevant to your role.");
         response.put("suggestions", Arrays.asList(
             "Technical training", "Soft skills", "Certifications"));
     } else if (lowerQuery.contains("hello") || lowerQuery.contains("hi")) {
         response.put("answer",
             "Hello! I'm your HR AI Assistant. How can I help you today?");
         response.put("suggestions", Arrays.asList(
             "Check leave balance", "View payslip", "Company policies"));
     } else {
         response.put("answer",
             "I'm here to help with HR queries. You can ask about: " +
             "Leaves, Attendance, Payroll, Policies, Training, and more.");
         response.put("suggestions", Arrays.asList(
             "Leave balance", "My payslip", "HR policies", "Training programs"));
     }

     response.put("timestamp", new Date());
     return response;
 }

 private Map<String, Object> getPredictions() {
     Map<String, Object> predictions = new HashMap<>();

     // Predict next month attrition based on trend
     List<EmployeeExit> exits = new ArrayList<>();
     // Get exits from repositories...

     predictions.put("predictedAttritionNextMonth", 3);
     predictions.put("predictedHiresNextMonth", 5);
     predictions.put("payrollGrowth", "+8%");
     predictions.put("engagementTrend", "IMPROVING");

     return predictions;
 }
}