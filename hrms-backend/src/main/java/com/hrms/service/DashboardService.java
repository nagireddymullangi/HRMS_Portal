
//service/DashboardService.java
package com.hrms.service;

import com.hrms.dto.response.DashboardResponse;

public interface DashboardService {
 DashboardResponse getAdminDashboard();
 DashboardResponse getEmployeeDashboard(Long employeeId);
}