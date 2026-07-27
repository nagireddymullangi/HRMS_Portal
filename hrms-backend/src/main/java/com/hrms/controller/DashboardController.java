
//controller/DashboardController.java
package com.hrms.controller;

import com.hrms.dto.response.ApiResponse;
import com.hrms.dto.response.DashboardResponse;
import com.hrms.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

 private final DashboardService dashboardService;

 @GetMapping("/admin")
 @PreAuthorize("hasRole('ADMIN')")
 public ResponseEntity<ApiResponse<DashboardResponse>> getAdminDashboard() {
     return ResponseEntity.ok(
             ApiResponse.success("Success",
                     dashboardService.getAdminDashboard()));
 }

 @GetMapping("/employee/{employeeId}")
 @PreAuthorize("hasAnyRole('ADMIN','EMPLOYEE')")
 public ResponseEntity<ApiResponse<DashboardResponse>> getEmployeeDashboard(
         @PathVariable Long employeeId) {
     return ResponseEntity.ok(
             ApiResponse.success("Success",
                     dashboardService.getEmployeeDashboard(employeeId)));
 }
}