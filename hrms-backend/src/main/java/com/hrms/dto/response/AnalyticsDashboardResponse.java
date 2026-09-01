
//dto/response/AnalyticsDashboardResponse.java
package com.hrms.dto.response;

import lombok.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class AnalyticsDashboardResponse {
 // Workforce KPIs
 private Long totalEmployees;
 private Long activeEmployees;
 private Long inactiveEmployees;
 private Long newHiresThisMonth;
 private Long exitsThisMonth;
 private Double avgTenureYears;
 private Double avgAge;

 // Attrition
 private Double attritionRate;
 private Double retentionRate;
 private Long voluntaryExits;
 private Long involuntaryExits;

 // Attendance
 private Double avgAttendanceRate;
 private Long lateArrivals;
 private Long absentToday;
 private Long onLeaveToday;

 // Payroll
 private BigDecimal totalMonthlyPayroll;
 private BigDecimal avgSalary;
 private BigDecimal totalDeductions;

 // Recruitment
 private Long openPositions;
 private Long totalApplications;
 private Long inInterview;
 private Long hiredThisMonth;
 private Double timeToHire;

 // Charts data
 private List<Map<String, Object>> departmentDistribution;
 private List<Map<String, Object>> genderDistribution;
 private List<Map<String, Object>> ageDistribution;
 private List<Map<String, Object>> tenureDistribution;
 private List<Map<String, Object>> monthlyHires;
 private List<Map<String, Object>> monthlyExits;
 private List<Map<String, Object>> attritionByDepartment;
 private List<Map<String, Object>> attendanceTrend;
 private List<Map<String, Object>> payrollTrend;
 private List<Map<String, Object>> topPerformers;
 private List<Map<String, Object>> recruitmentFunnel;
}