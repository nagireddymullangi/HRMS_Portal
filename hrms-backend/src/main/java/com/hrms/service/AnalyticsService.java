
//service/AnalyticsService.java
package com.hrms.service;

import com.hrms.dto.response.AnalyticsDashboardResponse;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

public interface AnalyticsService {
 AnalyticsDashboardResponse getExecutiveDashboard();

 Map<String, Object> getWorkforceAnalytics();
 Map<String, Object> getAttritionAnalytics(Integer year);
 Map<String, Object> getAttendanceAnalytics(LocalDate start, LocalDate end);
 Map<String, Object> getPayrollAnalytics(Integer year);
 Map<String, Object> getRecruitmentAnalytics();
 Map<String, Object> getDiversityMetrics();
 Map<String, Object> getTrainingAnalytics();

 // Custom reports
 List<Map<String, Object>> getDepartmentWiseReport();
 List<Map<String, Object>> getSalaryDistribution();
 Map<String, Object> getEmployeeCostAnalysis();
}