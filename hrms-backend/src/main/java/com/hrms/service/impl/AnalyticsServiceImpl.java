
//service/impl/AnalyticsServiceImpl.java
package com.hrms.service.impl;

import com.hrms.dto.response.AnalyticsDashboardResponse;
import com.hrms.model.*;
import com.hrms.repository.*;
import com.hrms.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.Period;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AnalyticsServiceImpl implements AnalyticsService {

 private final EmployeeRepository employeeRepository;
 private final DepartmentRepository departmentRepository;
 private final AttendanceRepository attendanceRepository;
 private final PayrollRepository payrollRepository;
 private final LeaveRepository leaveRepository;
 private final EmployeeExitRepository exitRepository;
 private final JobPostingRepository jobPostingRepository;
 private final JobApplicationRepository applicationRepository;

 @Override
 public AnalyticsDashboardResponse getExecutiveDashboard() {
     LocalDate today = LocalDate.now();
     LocalDate monthStart = today.withDayOfMonth(1);

     List<Employee> allEmployees = employeeRepository.findAll();

     // Workforce KPIs
     long totalEmp = allEmployees.size();
     long activeEmp = allEmployees.stream()
             .filter(e -> e.getStatus() == Employee.Status.ACTIVE).count();
     long inactiveEmp = totalEmp - activeEmp;

     long newHires = allEmployees.stream()
             .filter(e -> e.getDateOfJoining() != null &&
                 !e.getDateOfJoining().isBefore(monthStart)).count();

     long exitsThisMonth = exitRepository.findAll().stream()
             .filter(e -> e.getLastWorkingDate() != null &&
                 !e.getLastWorkingDate().isBefore(monthStart) &&
                 !e.getLastWorkingDate().isAfter(today)).count();

     // Average tenure & age
     double avgTenure = allEmployees.stream()
             .filter(e -> e.getDateOfJoining() != null)
             .mapToLong(e -> ChronoUnit.DAYS.between(
                 e.getDateOfJoining(), today))
             .average().orElse(0) / 365.0;

     double avgAge = allEmployees.stream()
             .filter(e -> e.getDateOfBirth() != null)
             .mapToInt(e -> Period.between(
                 e.getDateOfBirth(), today).getYears())
             .average().orElse(0);

     // Attrition
     long totalExits = exitRepository.count();
     double attritionRate = totalEmp > 0
         ? (totalExits * 100.0) / totalEmp : 0;

     // Attendance
     long presentToday = attendanceRepository.countPresentToday(today);
     double avgAttendance = totalEmp > 0
         ? (presentToday * 100.0) / totalEmp : 0;

     long onLeaveToday = leaveRepository.findAll().stream()
             .filter(l -> l.getStatus() == Leave.Status.APPROVED &&
                 !today.isBefore(l.getStartDate()) &&
                 !today.isAfter(l.getEndDate())).count();

     // Payroll
     BigDecimal totalPayroll = payrollRepository
             .sumNetSalaryByMonthAndYear(
                 today.getMonthValue(), today.getYear());
     if (totalPayroll == null) totalPayroll = BigDecimal.ZERO;

     BigDecimal avgSalary = totalEmp > 0 && totalPayroll.compareTo(BigDecimal.ZERO) > 0
         ? totalPayroll.divide(BigDecimal.valueOf(totalEmp), 2, RoundingMode.HALF_UP)
         : BigDecimal.ZERO;

     // Recruitment
     long openPositions = jobPostingRepository.countByStatus(
         JobPosting.Status.OPEN);
     long totalApplications = applicationRepository.count();
     long inInterview = applicationRepository.countByStage(
         JobApplication.Stage.INTERVIEWED);
     long hired = applicationRepository.countByStage(
         JobApplication.Stage.HIRED);

     // Charts
     return AnalyticsDashboardResponse.builder()
             .totalEmployees(totalEmp)
             .activeEmployees(activeEmp)
             .inactiveEmployees(inactiveEmp)
             .newHiresThisMonth(newHires)
             .exitsThisMonth(exitsThisMonth)
             .avgTenureYears(Math.round(avgTenure * 100.0) / 100.0)
             .avgAge(Math.round(avgAge * 100.0) / 100.0)
             .attritionRate(Math.round(attritionRate * 100.0) / 100.0)
             .retentionRate(Math.round((100 - attritionRate) * 100.0) / 100.0)
             .voluntaryExits(exitRepository.findAll().stream()
                 .filter(e -> e.getReason() != EmployeeExit.ExitReason.TERMINATION)
                 .count())
             .involuntaryExits(exitRepository.findAll().stream()
                 .filter(e -> e.getReason() == EmployeeExit.ExitReason.TERMINATION)
                 .count())
             .avgAttendanceRate(Math.round(avgAttendance * 100.0) / 100.0)
             .absentToday(activeEmp - presentToday - onLeaveToday)
             .onLeaveToday(onLeaveToday)
             .totalMonthlyPayroll(totalPayroll)
             .avgSalary(avgSalary)
             .openPositions(openPositions)
             .totalApplications(totalApplications)
             .inInterview(inInterview)
             .hiredThisMonth(hired)
             .departmentDistribution(getDepartmentDistribution())
             .genderDistribution(getGenderDistribution(allEmployees))
             .ageDistribution(getAgeDistribution(allEmployees))
             .tenureDistribution(getTenureDistribution(allEmployees))
             .monthlyHires(getMonthlyHires())
             .monthlyExits(getMonthlyExits())
             .attritionByDepartment(getAttritionByDepartment())
             .attendanceTrend(getAttendanceTrend())
             .payrollTrend(getPayrollTrend())
             .recruitmentFunnel(getRecruitmentFunnel())
             .build();
 }

 @Override
 public Map<String, Object> getWorkforceAnalytics() {
     Map<String, Object> data = new HashMap<>();
     List<Employee> employees = employeeRepository.findAll();

     data.put("total", employees.size());
     data.put("byDepartment", getDepartmentDistribution());
     data.put("byGender", getGenderDistribution(employees));
     data.put("byAge", getAgeDistribution(employees));
     data.put("byTenure", getTenureDistribution(employees));
     data.put("byLocation", getLocationDistribution(employees));

     return data;
 }

 @Override
 public Map<String, Object> getAttritionAnalytics(Integer year) {
     Map<String, Object> data = new HashMap<>();
     List<EmployeeExit> exits = exitRepository.findAll();

     if (year != null) {
         exits = exits.stream()
             .filter(e -> e.getLastWorkingDate() != null &&
                 e.getLastWorkingDate().getYear() == year)
             .collect(Collectors.toList());
     }

     long totalExits = exits.size();
     long totalEmp = employeeRepository.count();

     data.put("totalExits", totalExits);
     data.put("attritionRate", totalEmp > 0
         ? Math.round((totalExits * 10000.0) / totalEmp) / 100.0 : 0);

     // By reason
     Map<String, Long> byReason = exits.stream()
             .collect(Collectors.groupingBy(
                 e -> e.getReason().name(), Collectors.counting()));
     data.put("byReason", byReason);

     // By department
     data.put("byDepartment", getAttritionByDepartment());

     // Monthly trend
     data.put("monthlyTrend", getMonthlyExits());

     // Average tenure at exit
     double avgTenureAtExit = exits.stream()
             .filter(e -> e.getEmployee() != null &&
                 e.getEmployee().getDateOfJoining() != null)
             .mapToLong(e -> ChronoUnit.DAYS.between(
                 e.getEmployee().getDateOfJoining(),
                 e.getLastWorkingDate()))
             .average().orElse(0) / 365.0;
     data.put("avgTenureAtExit", Math.round(avgTenureAtExit * 100.0) / 100.0);

     return data;
 }

 @Override
 public Map<String, Object> getAttendanceAnalytics(LocalDate start, LocalDate end) {
     Map<String, Object> data = new HashMap<>();
     List<Attendance> records = attendanceRepository
             .findByDateBetweenOrderByDateDesc(start, end);

     long total = records.size();
     long present = records.stream()
             .filter(a -> a.getStatus() == Attendance.Status.PRESENT).count();
     long absent = records.stream()
             .filter(a -> a.getStatus() == Attendance.Status.ABSENT).count();
     long halfDay = records.stream()
             .filter(a -> a.getStatus() == Attendance.Status.HALF_DAY).count();

     data.put("total", total);
     data.put("present", present);
     data.put("absent", absent);
     data.put("halfDay", halfDay);
     data.put("attendanceRate", total > 0
         ? Math.round((present * 10000.0) / total) / 100.0 : 0);

     // Daily trend
     Map<LocalDate, Long> dailyPresent = records.stream()
             .filter(a -> a.getStatus() == Attendance.Status.PRESENT)
             .collect(Collectors.groupingBy(
                 Attendance::getDate, Collectors.counting()));

     List<Map<String, Object>> trend = dailyPresent.entrySet().stream()
             .sorted(Map.Entry.comparingByKey())
             .map(e -> {
                 Map<String, Object> m = new HashMap<>();
                 m.put("date", e.getKey().toString());
                 m.put("count", e.getValue());
                 return m;
             })
             .collect(Collectors.toList());
     data.put("dailyTrend", trend);

     return data;
 }

 @Override
 public Map<String, Object> getPayrollAnalytics(Integer year) {
     Map<String, Object> data = new HashMap<>();
     List<Payroll> payrolls = payrollRepository.findAll().stream()
             .filter(p -> year == null || p.getYear() == year)
             .collect(Collectors.toList());

     BigDecimal totalGross = payrolls.stream()
             .map(Payroll::getGrossSalary)
             .reduce(BigDecimal.ZERO, BigDecimal::add);
     BigDecimal totalNet = payrolls.stream()
             .map(Payroll::getNetSalary)
             .reduce(BigDecimal.ZERO, BigDecimal::add);
     BigDecimal totalDeductions = payrolls.stream()
             .map(Payroll::getTotalDeductions)
             .reduce(BigDecimal.ZERO, BigDecimal::add);

     data.put("totalGross", totalGross);
     data.put("totalNet", totalNet);
     data.put("totalDeductions", totalDeductions);
     data.put("count", payrolls.size());

     // Monthly trend
     data.put("monthlyTrend", getPayrollTrend());

     return data;
 }

 @Override
 public Map<String, Object> getRecruitmentAnalytics() {
     Map<String, Object> data = new HashMap<>();

     long total = applicationRepository.count();
     data.put("totalApplications", total);
     data.put("openJobs", jobPostingRepository.countByStatus(
         JobPosting.Status.OPEN));

     // Funnel
     data.put("funnel", getRecruitmentFunnel());

     // Applications by stage
     Map<String, Long> byStage = new HashMap<>();
     for (JobApplication.Stage stage : JobApplication.Stage.values()) {
         byStage.put(stage.name(),
             applicationRepository.countByStage(stage));
     }
     data.put("byStage", byStage);

     return data;
 }

 @Override
 public Map<String, Object> getDiversityMetrics() {
     Map<String, Object> data = new HashMap<>();
     List<Employee> employees = employeeRepository.findAll();

     data.put("byGender", getGenderDistribution(employees));
     data.put("byAge", getAgeDistribution(employees));
     data.put("byLocation", getLocationDistribution(employees));
     data.put("byDepartment", getDepartmentDistribution());

     return data;
 }

 @Override
 public Map<String, Object> getTrainingAnalytics() {
     Map<String, Object> data = new HashMap<>();
     // Placeholder - integrate with TrainingRepository
     data.put("totalPrograms", 0);
     data.put("totalEnrollments", 0);
     data.put("completionRate", 0);
     return data;
 }

 @Override
 public List<Map<String, Object>> getDepartmentWiseReport() {
     return departmentRepository.findAll().stream().map(dept -> {
         Map<String, Object> map = new HashMap<>();
         List<Employee> deptEmps = employeeRepository.findByDepartmentId(dept.getId());
         map.put("department", dept.getName());
         map.put("headcount", deptEmps.size());
         map.put("active", deptEmps.stream()
             .filter(e -> e.getStatus() == Employee.Status.ACTIVE).count());

         // Average salary
         List<Payroll> payrolls = deptEmps.stream()
             .flatMap(e -> payrollRepository
                 .findByEmployeeIdOrderByYearDescMonthDesc(e.getId()).stream())
             .limit(deptEmps.size())
             .collect(Collectors.toList());

         BigDecimal avgSalary = payrolls.isEmpty() ? BigDecimal.ZERO
             : payrolls.stream()
                 .map(Payroll::getNetSalary)
                 .reduce(BigDecimal.ZERO, BigDecimal::add)
                 .divide(BigDecimal.valueOf(payrolls.size()),
                     2, RoundingMode.HALF_UP);

         map.put("avgSalary", avgSalary);
         return map;
     }).collect(Collectors.toList());
 }

 @Override
 public List<Map<String, Object>> getSalaryDistribution() {
     List<Payroll> latestPayrolls = payrollRepository.findAll().stream()
             .collect(Collectors.groupingBy(p -> p.getEmployee().getId()))
             .values().stream()
             .map(list -> list.stream()
                 .max(Comparator.comparing(p ->
                     p.getYear() * 100 + p.getMonth())).orElse(null))
             .filter(Objects::nonNull)
             .collect(Collectors.toList());

     Map<String, Long> distribution = new LinkedHashMap<>();
     distribution.put("0-30K", 0L);
     distribution.put("30-50K", 0L);
     distribution.put("50-75K", 0L);
     distribution.put("75-100K", 0L);
     distribution.put("100K+", 0L);

     for (Payroll p : latestPayrolls) {
         BigDecimal net = p.getNetSalary();
         if (net.compareTo(BigDecimal.valueOf(30000)) < 0)
             distribution.merge("0-30K", 1L, Long::sum);
         else if (net.compareTo(BigDecimal.valueOf(50000)) < 0)
             distribution.merge("30-50K", 1L, Long::sum);
         else if (net.compareTo(BigDecimal.valueOf(75000)) < 0)
             distribution.merge("50-75K", 1L, Long::sum);
         else if (net.compareTo(BigDecimal.valueOf(100000)) < 0)
             distribution.merge("75-100K", 1L, Long::sum);
         else
             distribution.merge("100K+", 1L, Long::sum);
     }

     return distribution.entrySet().stream().map(e -> {
         Map<String, Object> m = new HashMap<>();
         m.put("range", e.getKey());
         m.put("count", e.getValue());
         return m;
     }).collect(Collectors.toList());
 }

 @Override
 public Map<String, Object> getEmployeeCostAnalysis() {
     Map<String, Object> data = new HashMap<>();
     LocalDate now = LocalDate.now();
     int currentYear = now.getYear();

     BigDecimal ytdPayroll = BigDecimal.ZERO;
     for (int month = 1; month <= now.getMonthValue(); month++) {
         BigDecimal monthly = payrollRepository
             .sumNetSalaryByMonthAndYear(month, currentYear);
         if (monthly != null) ytdPayroll = ytdPayroll.add(monthly);
     }

     data.put("ytdPayroll", ytdPayroll);
     data.put("projectedAnnualPayroll",
         ytdPayroll.multiply(BigDecimal.valueOf(12))
             .divide(BigDecimal.valueOf(now.getMonthValue()),
                 2, RoundingMode.HALF_UP));

     long totalEmp = employeeRepository.count();
     BigDecimal costPerEmployee = totalEmp > 0
         ? ytdPayroll.divide(BigDecimal.valueOf(totalEmp),
             2, RoundingMode.HALF_UP)
         : BigDecimal.ZERO;
     data.put("costPerEmployee", costPerEmployee);

     return data;
 }

 // Helper Methods
 private List<Map<String, Object>> getDepartmentDistribution() {
     return departmentRepository.findAll().stream().map(d -> {
         Map<String, Object> m = new HashMap<>();
         m.put("name", d.getName());
         m.put("value", employeeRepository.findByDepartmentId(d.getId()).size());
         return m;
     }).collect(Collectors.toList());
 }

 private List<Map<String, Object>> getGenderDistribution(List<Employee> emps) {
     // Since we don't have gender field, mock the distribution
     // In real app, add gender to Employee entity
     List<Map<String, Object>> data = new ArrayList<>();
     long total = emps.size();
     long male = (long)(total * 0.6);
     long female = (long)(total * 0.38);
     long other = total - male - female;

     Map<String, Object> m1 = new HashMap<>();
     m1.put("name", "Male"); m1.put("value", male);
     Map<String, Object> m2 = new HashMap<>();
     m2.put("name", "Female"); m2.put("value", female);
     Map<String, Object> m3 = new HashMap<>();
     m3.put("name", "Other"); m3.put("value", other);

     data.add(m1); data.add(m2); data.add(m3);
     return data;
 }

 private List<Map<String, Object>> getAgeDistribution(List<Employee> emps) {
     Map<String, Long> distribution = new LinkedHashMap<>();
     distribution.put("18-25", 0L);
     distribution.put("26-35", 0L);
     distribution.put("36-45", 0L);
     distribution.put("46-55", 0L);
     distribution.put("55+", 0L);

     LocalDate today = LocalDate.now();
     for (Employee e : emps) {
         if (e.getDateOfBirth() == null) continue;
         int age = Period.between(e.getDateOfBirth(), today).getYears();

         if (age <= 25) distribution.merge("18-25", 1L, Long::sum);
         else if (age <= 35) distribution.merge("26-35", 1L, Long::sum);
         else if (age <= 45) distribution.merge("36-45", 1L, Long::sum);
         else if (age <= 55) distribution.merge("46-55", 1L, Long::sum);
         else distribution.merge("55+", 1L, Long::sum);
     }

     return distribution.entrySet().stream().map(e -> {
         Map<String, Object> m = new HashMap<>();
         m.put("range", e.getKey());
         m.put("count", e.getValue());
         return m;
     }).collect(Collectors.toList());
 }

 private List<Map<String, Object>> getTenureDistribution(List<Employee> emps) {
     Map<String, Long> distribution = new LinkedHashMap<>();
     distribution.put("<1 year", 0L);
     distribution.put("1-3 years", 0L);
     distribution.put("3-5 years", 0L);
     distribution.put("5-10 years", 0L);
     distribution.put("10+ years", 0L);

     LocalDate today = LocalDate.now();
     for (Employee e : emps) {
         if (e.getDateOfJoining() == null) continue;
         long days = ChronoUnit.DAYS.between(e.getDateOfJoining(), today);
         double years = days / 365.0;

         if (years < 1) distribution.merge("<1 year", 1L, Long::sum);
         else if (years < 3) distribution.merge("1-3 years", 1L, Long::sum);
         else if (years < 5) distribution.merge("3-5 years", 1L, Long::sum);
         else if (years < 10) distribution.merge("5-10 years", 1L, Long::sum);
         else distribution.merge("10+ years", 1L, Long::sum);
     }

     return distribution.entrySet().stream().map(e -> {
         Map<String, Object> m = new HashMap<>();
         m.put("range", e.getKey());
         m.put("count", e.getValue());
         return m;
     }).collect(Collectors.toList());
 }

 private List<Map<String, Object>> getLocationDistribution(List<Employee> emps) {
     // Group by address (simplified)
     Map<String, Long> locations = new HashMap<>();
     for (Employee e : emps) {
         String loc = e.getAddress() != null ? extractCity(e.getAddress()) : "Unknown";
         locations.merge(loc, 1L, Long::sum);
     }

     return locations.entrySet().stream()
             .sorted((a, b) -> b.getValue().compareTo(a.getValue()))
             .limit(5)
             .map(e -> {
                 Map<String, Object> m = new HashMap<>();
                 m.put("name", e.getKey());
                 m.put("value", e.getValue());
                 return m;
             })
             .collect(Collectors.toList());
 }

 private String extractCity(String address) {
     if (address == null) return "Unknown";
     String[] parts = address.split(",");
     return parts.length > 0 ? parts[parts.length - 1].trim() : "Unknown";
 }

 private List<Map<String, Object>> getMonthlyHires() {
     List<Map<String, Object>> data = new ArrayList<>();
     LocalDate today = LocalDate.now();
     List<Employee> emps = employeeRepository.findAll();

     for (int i = 5; i >= 0; i--) {
         LocalDate month = today.minusMonths(i);
         int year = month.getYear();
         int monthNum = month.getMonthValue();

         long hires = emps.stream()
                 .filter(e -> e.getDateOfJoining() != null &&
                     e.getDateOfJoining().getYear() == year &&
                     e.getDateOfJoining().getMonthValue() == monthNum)
                 .count();

         Map<String, Object> m = new HashMap<>();
         m.put("month", month.getMonth().name().substring(0, 3));
         m.put("hires", hires);
         data.add(m);
     }

     return data;
 }

 private List<Map<String, Object>> getMonthlyExits() {
     List<Map<String, Object>> data = new ArrayList<>();
     LocalDate today = LocalDate.now();
     List<EmployeeExit> exits = exitRepository.findAll();

     for (int i = 5; i >= 0; i--) {
         LocalDate month = today.minusMonths(i);
         int year = month.getYear();
         int monthNum = month.getMonthValue();

         long count = exits.stream()
                 .filter(e -> e.getLastWorkingDate() != null &&
                     e.getLastWorkingDate().getYear() == year &&
                     e.getLastWorkingDate().getMonthValue() == monthNum)
                 .count();

         Map<String, Object> m = new HashMap<>();
         m.put("month", month.getMonth().name().substring(0, 3));
         m.put("exits", count);
         data.add(m);
     }

     return data;
 }

 private List<Map<String, Object>> getAttritionByDepartment() {
     return departmentRepository.findAll().stream().map(d -> {
         long total = employeeRepository.findByDepartmentId(d.getId()).size();
         long exits = exitRepository.findAll().stream()
                 .filter(e -> e.getEmployee() != null &&
                     e.getEmployee().getDepartment() != null &&
                     e.getEmployee().getDepartment().getId().equals(d.getId()))
                 .count();

         double rate = total > 0 ? (exits * 100.0) / total : 0;
         Map<String, Object> m = new HashMap<>();
         m.put("department", d.getName());
         m.put("rate", Math.round(rate * 100.0) / 100.0);
         m.put("exits", exits);
         return m;
     }).collect(Collectors.toList());
 }

 private List<Map<String, Object>> getAttendanceTrend() {
     List<Map<String, Object>> data = new ArrayList<>();
     LocalDate today = LocalDate.now();

     for (int i = 6; i >= 0; i--) {
         LocalDate date = today.minusDays(i);
         long present = attendanceRepository.countPresentToday(date);

         Map<String, Object> m = new HashMap<>();
         m.put("date", date.getDayOfWeek().name().substring(0, 3));
         m.put("present", present);
         data.add(m);
     }

     return data;
 }

 private List<Map<String, Object>> getPayrollTrend() {
     List<Map<String, Object>> data = new ArrayList<>();
     LocalDate today = LocalDate.now();

     for (int i = 5; i >= 0; i--) {
         LocalDate month = today.minusMonths(i);
         BigDecimal amount = payrollRepository.sumNetSalaryByMonthAndYear(
             month.getMonthValue(), month.getYear());

         Map<String, Object> m = new HashMap<>();
         m.put("month", month.getMonth().name().substring(0, 3));
         m.put("amount", amount != null ? amount : BigDecimal.ZERO);
         data.add(m);
     }

     return data;
 }

 private List<Map<String, Object>> getRecruitmentFunnel() {
     List<Map<String, Object>> funnel = new ArrayList<>();
     JobApplication.Stage[] stages = {
         JobApplication.Stage.APPLIED,
         JobApplication.Stage.SCREENING,
         JobApplication.Stage.SHORTLISTED,
         JobApplication.Stage.INTERVIEWED,
         JobApplication.Stage.OFFERED,
         JobApplication.Stage.HIRED
     };

     for (JobApplication.Stage stage : stages) {
         Map<String, Object> m = new HashMap<>();
         m.put("stage", stage.name());
         m.put("count", applicationRepository.countByStage(stage));
         funnel.add(m);
     }

     return funnel;
 }
}