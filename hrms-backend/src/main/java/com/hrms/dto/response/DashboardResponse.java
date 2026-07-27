
//dto/response/DashboardResponse.java
package com.hrms.dto.response;

import lombok.*;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class DashboardResponse {
 // Admin stats
 private Long totalEmployees;
 private Long activeEmployees;
 private Long totalDepartments;
 private Long presentToday;
 private Long pendingLeaves;
 private BigDecimal totalPayrollThisMonth;

 // Charts data
 private List<Map<String, Object>> departmentWiseEmployees;
 private List<Map<String, Object>> monthlyAttendance;
 private List<Map<String, Object>> leaveStatusStats;

 // Employee stats
 private Long myPresentDays;
 private Long myAbsentDays;
 private Long myPendingLeaves;
 private Long myApprovedLeaves;
 private List<LeaveResponse> recentLeaves;
 private List<AttendanceResponse> recentAttendance;
 private PayrollResponse latestPayroll;
}