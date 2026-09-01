
//controller/AnalyticsController.java
package com.hrms.controller;

import com.hrms.dto.response.ApiResponse;
import com.hrms.dto.response.AnalyticsDashboardResponse;
import com.hrms.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AnalyticsController {

 private final AnalyticsService service;

 @GetMapping("/dashboard")
 public ResponseEntity<ApiResponse<AnalyticsDashboardResponse>> getDashboard() {
     return ResponseEntity.ok(ApiResponse.success("Success",
         service.getExecutiveDashboard()));
 }

 @GetMapping("/workforce")
 public ResponseEntity<ApiResponse<Map<String, Object>>> getWorkforce() {
     return ResponseEntity.ok(ApiResponse.success("Success",
         service.getWorkforceAnalytics()));
 }

 @GetMapping("/attrition")
 public ResponseEntity<ApiResponse<Map<String, Object>>> getAttrition(
         @RequestParam(required = false) Integer year) {
     return ResponseEntity.ok(ApiResponse.success("Success",
         service.getAttritionAnalytics(year)));
 }

 @GetMapping("/attendance")
 public ResponseEntity<ApiResponse<Map<String, Object>>> getAttendance(
         @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
         LocalDate startDate,
         @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
         LocalDate endDate) {
     return ResponseEntity.ok(ApiResponse.success("Success",
         service.getAttendanceAnalytics(startDate, endDate)));
 }

 @GetMapping("/payroll")
 public ResponseEntity<ApiResponse<Map<String, Object>>> getPayroll(
         @RequestParam(required = false) Integer year) {
     return ResponseEntity.ok(ApiResponse.success("Success",
         service.getPayrollAnalytics(year)));
 }

 @GetMapping("/recruitment")
 public ResponseEntity<ApiResponse<Map<String, Object>>> getRecruitment() {
     return ResponseEntity.ok(ApiResponse.success("Success",
         service.getRecruitmentAnalytics()));
 }

 @GetMapping("/diversity")
 public ResponseEntity<ApiResponse<Map<String, Object>>> getDiversity() {
     return ResponseEntity.ok(ApiResponse.success("Success",
         service.getDiversityMetrics()));
 }

 @GetMapping("/department-report")
 public ResponseEntity<ApiResponse<List<Map<String, Object>>>>
         getDepartmentReport() {
     return ResponseEntity.ok(ApiResponse.success("Success",
         service.getDepartmentWiseReport()));
 }

 @GetMapping("/salary-distribution")
 public ResponseEntity<ApiResponse<List<Map<String, Object>>>>
         getSalaryDistribution() {
     return ResponseEntity.ok(ApiResponse.success("Success",
         service.getSalaryDistribution()));
 }

 @GetMapping("/cost-analysis")
 public ResponseEntity<ApiResponse<Map<String, Object>>> getCostAnalysis() {
     return ResponseEntity.ok(ApiResponse.success("Success",
         service.getEmployeeCostAnalysis()));
 }
}