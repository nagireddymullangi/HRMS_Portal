
//service/TimesheetService.java
package com.hrms.service;

import com.hrms.dto.response.TimesheetResponse;
import com.hrms.model.Timesheet;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

public interface TimesheetService {
 TimesheetResponse create(Timesheet timesheet);
 TimesheetResponse update(Long id, Timesheet timesheet);
 TimesheetResponse getById(Long id);
 List<TimesheetResponse> getAll();
 List<TimesheetResponse> getByEmployee(Long employeeId);
 List<TimesheetResponse> getByEmployeeAndDateRange(
     Long employeeId, LocalDate start, LocalDate end);
 List<TimesheetResponse> getByProject(Long projectId);
 List<TimesheetResponse> getByStatus(String status);
 void delete(Long id);

 // Workflow
 TimesheetResponse submit(Long id);
 TimesheetResponse approve(Long id, Long approverId);
 TimesheetResponse reject(Long id, String reason);
 void submitBulk(List<Long> ids);
 void approveBulk(List<Long> ids, Long approverId);

 // Analytics
 BigDecimal getTotalHours(Long employeeId, LocalDate start, LocalDate end);
 Map<String, Object> getEmployeeStats(Long employeeId);
 Map<String, Object> getProjectStats(Long projectId);
 Map<String, Object> getWeeklySummary(Long employeeId, LocalDate weekStart);
}