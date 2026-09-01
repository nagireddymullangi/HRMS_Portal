
//service/impl/TimesheetServiceImpl.java
package com.hrms.service.impl;

import com.hrms.dto.response.TimesheetResponse;
import com.hrms.exception.HrmsAPIException;
import com.hrms.exception.ResourceNotFoundException;
import com.hrms.model.*;
import com.hrms.repository.*;
import com.hrms.service.TimesheetService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class TimesheetServiceImpl implements TimesheetService {

 private final TimesheetRepository timesheetRepository;
 private final ProjectRepository projectRepository;
 private final ProjectTaskRepository taskRepository;
 private final EmployeeRepository employeeRepository;

 @Override
 @Transactional
 public TimesheetResponse create(Timesheet timesheet) {
     // Validate hours
     if (timesheet.getHoursWorked().compareTo(BigDecimal.valueOf(24)) > 0) {
         throw new HrmsAPIException(HttpStatus.BAD_REQUEST,
             "Hours cannot exceed 24 per day");
     }
     if (timesheet.getHoursWorked().compareTo(BigDecimal.ZERO) <= 0) {
         throw new HrmsAPIException(HttpStatus.BAD_REQUEST,
             "Hours must be greater than 0");
     }

     Timesheet saved = timesheetRepository.save(timesheet);

     // Update project actual hours
     updateProjectHours(saved.getProject().getId());

     return mapToResponse(saved);
 }

 @Override
 @Transactional
 public TimesheetResponse update(Long id, Timesheet timesheet) {
     Timesheet existing = timesheetRepository.findById(id)
             .orElseThrow(() -> new ResourceNotFoundException(
                 "Timesheet", "id", id));

     if (existing.getStatus() == Timesheet.Status.APPROVED) {
         throw new HrmsAPIException(HttpStatus.BAD_REQUEST,
             "Cannot edit approved timesheet");
     }

     existing.setWorkDate(timesheet.getWorkDate());
     existing.setHoursWorked(timesheet.getHoursWorked());
     existing.setDescription(timesheet.getDescription());
     existing.setIsBillable(timesheet.getIsBillable());
     if (timesheet.getProject() != null) {
         existing.setProject(timesheet.getProject());
     }

     Timesheet saved = timesheetRepository.save(existing);
     updateProjectHours(saved.getProject().getId());
     return mapToResponse(saved);
 }

 @Override
 public TimesheetResponse getById(Long id) {
     Timesheet t = timesheetRepository.findById(id)
             .orElseThrow(() -> new ResourceNotFoundException(
                 "Timesheet", "id", id));
     return mapToResponse(t);
 }

 @Override
 public List<TimesheetResponse> getAll() {
     return timesheetRepository.findAllByOrderByCreatedAtDesc()
             .stream().map(this::mapToResponse)
             .collect(Collectors.toList());
 }

 @Override
 public List<TimesheetResponse> getByEmployee(Long employeeId) {
     return timesheetRepository.findByEmployeeIdOrderByWorkDateDesc(employeeId)
             .stream().map(this::mapToResponse)
             .collect(Collectors.toList());
 }

 @Override
 public List<TimesheetResponse> getByEmployeeAndDateRange(
         Long employeeId, LocalDate start, LocalDate end) {
     return timesheetRepository
             .findByEmployeeIdAndWorkDateBetweenOrderByWorkDateDesc(
                 employeeId, start, end)
             .stream().map(this::mapToResponse)
             .collect(Collectors.toList());
 }

 @Override
 public List<TimesheetResponse> getByProject(Long projectId) {
     return timesheetRepository.findByProjectIdOrderByWorkDateDesc(projectId)
             .stream().map(this::mapToResponse)
             .collect(Collectors.toList());
 }

 @Override
 public List<TimesheetResponse> getByStatus(String status) {
     return timesheetRepository
             .findByStatusOrderByCreatedAtDesc(Timesheet.Status.valueOf(status))
             .stream().map(this::mapToResponse)
             .collect(Collectors.toList());
 }

 @Override
 public void delete(Long id) {
     Timesheet t = timesheetRepository.findById(id)
             .orElseThrow(() -> new ResourceNotFoundException(
                 "Timesheet", "id", id));

     if (t.getStatus() == Timesheet.Status.APPROVED) {
         throw new HrmsAPIException(HttpStatus.BAD_REQUEST,
             "Cannot delete approved timesheet");
     }

     Long projectId = t.getProject().getId();
     timesheetRepository.deleteById(id);
     updateProjectHours(projectId);
 }

 @Override
 @Transactional
 public TimesheetResponse submit(Long id) {
     Timesheet t = timesheetRepository.findById(id)
             .orElseThrow(() -> new ResourceNotFoundException(
                 "Timesheet", "id", id));
     t.setStatus(Timesheet.Status.SUBMITTED);
     return mapToResponse(timesheetRepository.save(t));
 }

 @Override
 @Transactional
 public TimesheetResponse approve(Long id, Long approverId) {
     Timesheet t = timesheetRepository.findById(id)
             .orElseThrow(() -> new ResourceNotFoundException(
                 "Timesheet", "id", id));

     t.setStatus(Timesheet.Status.APPROVED);
     t.setApprovedBy(approverId);
     t.setApprovedAt(LocalDateTime.now());
     Timesheet saved = timesheetRepository.save(t);
     updateProjectHours(saved.getProject().getId());
     return mapToResponse(saved);
 }

 @Override
 @Transactional
 public TimesheetResponse reject(Long id, String reason) {
     Timesheet t = timesheetRepository.findById(id)
             .orElseThrow(() -> new ResourceNotFoundException(
                 "Timesheet", "id", id));

     t.setStatus(Timesheet.Status.REJECTED);
     t.setRejectionReason(reason);
     return mapToResponse(timesheetRepository.save(t));
 }

 @Override
 @Transactional
 public void submitBulk(List<Long> ids) {
     for (Long id : ids) {
         try { submit(id); } catch (Exception e) {
             log.error("Failed to submit timesheet {}", id);
         }
     }
 }

 @Override
 @Transactional
 public void approveBulk(List<Long> ids, Long approverId) {
     for (Long id : ids) {
         try { approve(id, approverId); } catch (Exception e) {
             log.error("Failed to approve timesheet {}", id);
         }
     }
 }

 @Override
 public BigDecimal getTotalHours(Long employeeId,
                                   LocalDate start, LocalDate end) {
     BigDecimal total = timesheetRepository
             .sumHoursByEmployeeAndDateRange(employeeId, start, end);
     return total != null ? total : BigDecimal.ZERO;
 }

 @Override
 public Map<String, Object> getEmployeeStats(Long employeeId) {
     Map<String, Object> stats = new HashMap<>();
     LocalDate today = LocalDate.now();
     LocalDate weekStart = today.minusDays(today.getDayOfWeek().getValue() - 1);
     LocalDate monthStart = today.withDayOfMonth(1);

     stats.put("todayHours", getTotalHours(employeeId, today, today));
     stats.put("weekHours",
         getTotalHours(employeeId, weekStart, today));
     stats.put("monthHours",
         getTotalHours(employeeId, monthStart, today));

     List<Timesheet> all = timesheetRepository
             .findByEmployeeIdOrderByWorkDateDesc(employeeId);

     stats.put("draftCount", all.stream()
         .filter(t -> t.getStatus() == Timesheet.Status.DRAFT).count());
     stats.put("submittedCount", all.stream()
         .filter(t -> t.getStatus() == Timesheet.Status.SUBMITTED).count());
     stats.put("approvedCount", all.stream()
         .filter(t -> t.getStatus() == Timesheet.Status.APPROVED).count());

     return stats;
 }

 @Override
 public Map<String, Object> getProjectStats(Long projectId) {
     Map<String, Object> stats = new HashMap<>();
     Project project = projectRepository.findById(projectId)
             .orElseThrow(() -> new ResourceNotFoundException(
                 "Project", "id", projectId));

     BigDecimal approvedHours = timesheetRepository
             .sumApprovedHoursByProject(projectId);
     approvedHours = approvedHours != null ? approvedHours : BigDecimal.ZERO;

     stats.put("approvedHours", approvedHours);
     stats.put("estimatedHours", project.getEstimatedHours());
     stats.put("budget", project.getBudget());
     stats.put("hourlyRate", project.getHourlyRate());

     if (project.getHourlyRate() != null) {
         stats.put("totalCost", approvedHours.multiply(project.getHourlyRate()));
     }

     return stats;
 }

 @Override
 public Map<String, Object> getWeeklySummary(Long employeeId,
                                               LocalDate weekStart) {
     LocalDate weekEnd = weekStart.plusDays(6);
     List<Timesheet> weekTimesheets = timesheetRepository
             .findByEmployeeIdAndWorkDateBetweenOrderByWorkDateDesc(
                 employeeId, weekStart, weekEnd);

     Map<String, Object> summary = new HashMap<>();
     Map<String, BigDecimal> dailyHours = new LinkedHashMap<>();

     for (int i = 0; i < 7; i++) {
         LocalDate date = weekStart.plusDays(i);
         BigDecimal total = weekTimesheets.stream()
                 .filter(t -> t.getWorkDate().equals(date))
                 .map(Timesheet::getHoursWorked)
                 .reduce(BigDecimal.ZERO, BigDecimal::add);
         dailyHours.put(date.toString(), total);
     }

     summary.put("dailyHours", dailyHours);
     summary.put("totalHours", weekTimesheets.stream()
             .map(Timesheet::getHoursWorked)
             .reduce(BigDecimal.ZERO, BigDecimal::add));
     summary.put("entriesCount", weekTimesheets.size());

     return summary;
 }

 private void updateProjectHours(Long projectId) {
     try {
         BigDecimal approved = timesheetRepository
                 .sumApprovedHoursByProject(projectId);
         Project project = projectRepository.findById(projectId).orElse(null);
         if (project != null) {
             project.setActualHours(approved != null ? approved : BigDecimal.ZERO);
             projectRepository.save(project);
         }
     } catch (Exception e) {
         log.error("Failed to update project hours", e);
     }
 }

 private TimesheetResponse mapToResponse(Timesheet t) {
     return TimesheetResponse.builder()
             .id(t.getId())
             .employeeId(t.getEmployee().getId())
             .employeeName(t.getEmployee().getFullName())
             .employeeCode(t.getEmployee().getEmployeeId())
             .projectId(t.getProject().getId())
             .projectName(t.getProject().getName())
             .projectCode(t.getProject().getProjectCode())
             .taskId(t.getTaskId())
             .workDate(t.getWorkDate())
             .hoursWorked(t.getHoursWorked())
             .description(t.getDescription())
             .isBillable(t.getIsBillable())
             .status(t.getStatus().name())
             .approvedBy(t.getApprovedBy())
             .approvedAt(t.getApprovedAt())
             .rejectionReason(t.getRejectionReason())
             .createdAt(t.getCreatedAt())
             .build();
 }
}