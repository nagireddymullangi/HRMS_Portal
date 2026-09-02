
//service/DailyWorkService.java
package com.hrms.service;

import com.hrms.dto.response.AssignmentResponse;
import com.hrms.dto.response.BreakSessionResponse;
import com.hrms.dto.response.DailyWorkDashboard;
import com.hrms.model.AssignmentComment;
import com.hrms.model.BreakSession;
import com.hrms.model.DailyWorkAssignment;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

public interface DailyWorkService {

 // Assignments
 AssignmentResponse createAssignment(
     DailyWorkAssignment assignment, Long assignedBy);
 List<AssignmentResponse> createBulkAssignments(
     List<DailyWorkAssignment> assignments, Long assignedBy);
 AssignmentResponse updateAssignment(Long id, DailyWorkAssignment assignment);
 AssignmentResponse getAssignment(Long id);
 List<AssignmentResponse> getMyAssignments(Long employeeId);
 List<AssignmentResponse> getMyAssignmentsByDate(Long employeeId, LocalDate date);
 List<AssignmentResponse> getMyAssignmentsByDateRange(
     Long employeeId, LocalDate start, LocalDate end);
 List<AssignmentResponse> getAllAssignments();
 List<AssignmentResponse> getAssignmentsByDate(LocalDate date);
 List<AssignmentResponse> getOverdueAssignments();
 void deleteAssignment(Long id);

 // Workflow
 AssignmentResponse acceptAssignment(Long id);
 AssignmentResponse startTask(Long id);
 AssignmentResponse pauseTask(Long id, String reason);
 AssignmentResponse blockTask(Long id, String blockerReason);
 AssignmentResponse resumeTask(Long id);
 AssignmentResponse completeTask(Long id, String notes);
 AssignmentResponse updateProgress(Long id, Integer percentage);

 // Comments
 AssignmentComment addComment(Long assignmentId, Long userId,
                                String comment, String type);
 List<AssignmentComment> getComments(Long assignmentId);

 // Break Management
 BreakSessionResponse startBreak(Long employeeId, String breakType,
                                  String reason, String location);
 BreakSessionResponse endBreak(Long sessionId);
 BreakSessionResponse getCurrentBreak(Long employeeId);
 List<BreakSessionResponse> getMyBreaks(Long employeeId);
 List<BreakSessionResponse> getAllActiveBreaks();
 BreakSessionResponse forceEndBreak(Long sessionId, String adminNote);

 // Dashboard
 DailyWorkDashboard getMyDashboard(Long employeeId);
 Map<String, Object> getTeamDashboard();
 Map<String, Object> getEmployeeStats(Long employeeId, LocalDate start,
                                       LocalDate end);
}