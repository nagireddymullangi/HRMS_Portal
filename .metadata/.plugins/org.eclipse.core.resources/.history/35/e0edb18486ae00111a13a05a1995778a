package com.hrms.service.impl;

import com.hrms.dto.response.AssignmentResponse;
import com.hrms.dto.response.BreakSessionResponse;
import com.hrms.dto.response.DailyWorkDashboard;
import com.hrms.exception.HrmsAPIException;
import com.hrms.exception.ResourceNotFoundException;
import com.hrms.model.*;
import com.hrms.repository.*;
import com.hrms.service.DailyWorkService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class DailyWorkServiceImpl implements DailyWorkService {

    private final DailyWorkAssignmentRepository assignmentRepository;
    private final BreakSessionRepository breakRepository;
    private final AssignmentCommentRepository commentRepository;
    private final EmployeeRepository employeeRepository;
    private final UserRepository userRepository;
    private final ProjectRepository projectRepository;

    @Override
    @Transactional
    public AssignmentResponse createAssignment(DailyWorkAssignment a, Long assignedBy) {
        a.setAssignmentNumber("TSK-" + LocalDate.now().getYear() + "-" + (assignmentRepository.count() + 1));
        a.setAssignedBy(assignedBy);
        a.setStatus(DailyWorkAssignment.Status.ASSIGNED);
        if (a.getAssignmentDate() == null) a.setAssignmentDate(LocalDate.now());
        return mapToResponse(assignmentRepository.save(a));
    }

    @Override
    @Transactional
    public AssignmentResponse updateAssignment(Long id, DailyWorkAssignment req) {
        DailyWorkAssignment a = getAssignmentEntity(id);
        a.setTitle(req.getTitle());
        a.setDescription(req.getDescription());
        a.setCategory(req.getCategory());
        a.setPriority(req.getPriority());
        a.setDueDate(req.getDueDate());
        a.setDueTime(req.getDueTime());
        a.setEstimatedHours(req.getEstimatedHours());
        a.setProjectId(req.getProjectId());
        return mapToResponse(assignmentRepository.save(a));
    }

    @Override
    public AssignmentResponse getAssignment(Long id) {
        return mapToResponse(getAssignmentEntity(id));
    }

    @Override
    public List<AssignmentResponse> getMyAssignments(Long employeeId) {
        return assignmentRepository.findByEmployeeIdOrderByAssignmentDateDesc(employeeId)
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Override
    public List<AssignmentResponse> getAssignmentsByDate(LocalDate date) {
        return assignmentRepository.findAllByDate(date)
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Override
    public void deleteAssignment(Long id) {
        assignmentRepository.deleteById(id);
    }

    // ================== TIME TRACKING WORKFLOW ==================

    @Override
    @Transactional
    public AssignmentResponse acceptAssignment(Long id) {
        DailyWorkAssignment a = getAssignmentEntity(id);
        a.setStatus(DailyWorkAssignment.Status.ACCEPTED);
        a.setAcceptedAt(LocalDateTime.now());
        return mapToResponse(assignmentRepository.save(a));
    }

    @Override
    @Transactional
    public AssignmentResponse startTask(Long id) {
        DailyWorkAssignment a = getAssignmentEntity(id);
        a.setStatus(DailyWorkAssignment.Status.IN_PROGRESS);
        
        if (a.getStartedAt() == null) {
            a.setStartedAt(LocalDateTime.now());
        } else {
            a.setResumedAt(LocalDateTime.now());
        }
        return mapToResponse(assignmentRepository.save(a));
    }

    @Override
    @Transactional
    public AssignmentResponse pauseTask(Long id, String reason) {
        DailyWorkAssignment a = getAssignmentEntity(id);
        a.setStatus(DailyWorkAssignment.Status.ON_HOLD);
        a.setPausedAt(LocalDateTime.now());
        a.setBlockerReason(reason);
        a.setPauseCount((a.getPauseCount() == null ? 0 : a.getPauseCount()) + 1);

        if (a.getStartedAt() != null) {
            LocalDateTime lastStart = a.getResumedAt() != null ? a.getResumedAt() : a.getStartedAt();
            long sessionSecs = Duration.between(lastStart, LocalDateTime.now()).getSeconds();
            a.setTotalActiveSeconds((a.getTotalActiveSeconds() == null ? 0 : a.getTotalActiveSeconds()) + sessionSecs);
        }
        return mapToResponse(assignmentRepository.save(a));
    }

    @Override
    @Transactional
    public AssignmentResponse blockTask(Long id, String blockerReason) {
        DailyWorkAssignment a = getAssignmentEntity(id);
        a.setStatus(DailyWorkAssignment.Status.BLOCKED);
        a.setPausedAt(LocalDateTime.now());
        a.setBlockerReason(blockerReason);
        
        if (a.getStartedAt() != null) {
            LocalDateTime lastStart = a.getResumedAt() != null ? a.getResumedAt() : a.getStartedAt();
            long sessionSecs = Duration.between(lastStart, LocalDateTime.now()).getSeconds();
            a.setTotalActiveSeconds((a.getTotalActiveSeconds() == null ? 0 : a.getTotalActiveSeconds()) + sessionSecs);
        }
        return mapToResponse(assignmentRepository.save(a));
    }

    @Override
    @Transactional
    public AssignmentResponse resumeTask(Long id) {
        DailyWorkAssignment a = getAssignmentEntity(id);
        
        if (a.getPausedAt() != null) {
            long pauseSecs = Duration.between(a.getPausedAt(), LocalDateTime.now()).getSeconds();
            a.setTotalPauseSeconds((a.getTotalPauseSeconds() == null ? 0 : a.getTotalPauseSeconds()) + pauseSecs);
        }
        
        a.setStatus(DailyWorkAssignment.Status.IN_PROGRESS);
        a.setResumedAt(LocalDateTime.now());
        a.setBlockerReason(null);
        return mapToResponse(assignmentRepository.save(a));
    }

    @Override
    @Transactional
    public AssignmentResponse completeTask(Long id, String notes) {
        DailyWorkAssignment a = getAssignmentEntity(id);
        a.setStatus(DailyWorkAssignment.Status.COMPLETED);
        a.setCompletionNotes(notes);
        a.setCompletedAt(LocalDateTime.now());
        a.setProgressPercentage(100);

        if (a.getStartedAt() != null) {
            LocalDateTime lastStart = a.getResumedAt() != null ? a.getResumedAt() : a.getStartedAt();
            long sessionSecs = Duration.between(lastStart, LocalDateTime.now()).getSeconds();
            a.setTotalActiveSeconds((a.getTotalActiveSeconds() == null ? 0 : a.getTotalActiveSeconds()) + sessionSecs);
            
            // Calculate actual hours (HH.MM)
            double hours = a.getTotalActiveSeconds() / 3600.0;
            a.setActualHours(BigDecimal.valueOf(hours).setScale(2, RoundingMode.HALF_UP));
        }
        return mapToResponse(assignmentRepository.save(a));
    }

    @Override
    @Transactional
    public AssignmentResponse updateProgress(Long id, Integer percentage) {
        DailyWorkAssignment a = getAssignmentEntity(id);
        a.setProgressPercentage(percentage);
        if (percentage == 100) {
            return completeTask(id, "Marked 100% complete via slider");
        } else if (percentage > 0 && a.getStatus() == DailyWorkAssignment.Status.ASSIGNED) {
            return startTask(id);
        }
        return mapToResponse(assignmentRepository.save(a));
    }

    // ================== COMMENTS & BREAKS ==================

    @Override
    public AssignmentComment addComment(Long id, Long userId, String comment, String type) {
        DailyWorkAssignment a = getAssignmentEntity(id);
        AssignmentComment c = AssignmentComment.builder()
                .assignment(a).userId(userId).comment(comment)
                .commentType(AssignmentComment.CommentType.valueOf(type)).build();
        return commentRepository.save(c);
    }

    @Override
    public List<AssignmentComment> getComments(Long id) {
        return commentRepository.findByAssignmentIdOrderByCreatedAtDesc(id);
    }

    @Override
    @Transactional
    public BreakSessionResponse startBreak(Long empId, String type, String reason, String location) {
        Employee emp = employeeRepository.findById(empId).orElseThrow();
        if (breakRepository.findByEmployeeIdAndStatus(empId, BreakSession.Status.ACTIVE).isPresent()) {
            throw new HrmsAPIException(HttpStatus.BAD_REQUEST, "Break already active");
        }
        BreakSession.BreakType bType = BreakSession.BreakType.valueOf(type);
        BreakSession b = BreakSession.builder().employee(emp).breakType(bType)
                .startTime(LocalDateTime.now()).maxAllowedMinutes(bType.getDefaultMaxMinutes())
                .reason(reason).location(location).status(BreakSession.Status.ACTIVE).build();
        return mapBreak(breakRepository.save(b));
    }

    @Override
    @Transactional
    public BreakSessionResponse endBreak(Long sessionId) {
        BreakSession b = breakRepository.findById(sessionId).orElseThrow();
        b.setEndTime(LocalDateTime.now());
        long mins = Duration.between(b.getStartTime(), b.getEndTime()).toMinutes();
        b.setDurationMinutes((int) mins);
        b.setStatus(BreakSession.Status.COMPLETED);
        if (mins > b.getMaxAllowedMinutes()) b.setIsExceeded(true);
        return mapBreak(breakRepository.save(b));
    }

    @Override
    public List<BreakSessionResponse> getActiveBreaks() {
        return breakRepository.findAllActive().stream().map(this::mapBreak).collect(Collectors.toList());
    }

    @Override
    public BreakSessionResponse forceEndBreak(Long sessionId, String note) {
        BreakSession b = breakRepository.findById(sessionId).orElseThrow();
        b.setEndTime(LocalDateTime.now());
        b.setDurationMinutes((int) Duration.between(b.getStartTime(), b.getEndTime()).toMinutes());
        b.setStatus(BreakSession.Status.FORCE_STOPPED);
        b.setReason(b.getReason() + " | Admin: " + note);
        return mapBreak(breakRepository.save(b));
    }

    // ================== DASHBOARDS ==================

    @Override
    public DailyWorkDashboard getMyDashboard(Long empId) {
        LocalDate today = LocalDate.now();
        List<DailyWorkAssignment> todayTasks = assignmentRepository
                .findByEmployeeIdAndAssignmentDateOrderByPriorityDesc(empId, today);
                
        List<DailyWorkAssignment> upcoming = assignmentRepository
                .findByEmployeeIdAndAssignmentDateBetweenOrderByAssignmentDateDesc(
                        empId, today.plusDays(1), today.plusDays(7));

        BreakSession currentBreak = breakRepository
                .findByEmployeeIdAndStatus(empId, BreakSession.Status.ACTIVE).orElse(null);

        int comp = 0, inProg = 0, pend = 0, block = 0, over = 0;
        for (DailyWorkAssignment t : todayTasks) {
            if (t.getStatus() == DailyWorkAssignment.Status.COMPLETED) comp++;
            else if (t.getStatus() == DailyWorkAssignment.Status.IN_PROGRESS) inProg++;
            else if (t.getStatus() == DailyWorkAssignment.Status.BLOCKED) block++;
            else pend++;
            if (t.isOverdue()) over++;
        }

        return DailyWorkDashboard.builder()
                .totalTasks(todayTasks.size())
                .completed(comp).inProgress(inProg).pending(pend).blocked(block).overdue(over)
                .currentBreak(currentBreak != null ? mapBreak(currentBreak) : null)
                .todayTasks(todayTasks.stream().map(this::mapToResponse).collect(Collectors.toList()))
                .upcomingTasks(upcoming.stream().limit(5).map(this::mapToResponse).collect(Collectors.toList()))
                .build();
    }

    @Override
    public Map<String, Object> getTeamDashboard() {
        Map<String, Object> data = new HashMap<>();
        List<DailyWorkAssignment> tasks = assignmentRepository.findAllByDate(LocalDate.now());
        List<BreakSession> breaks = breakRepository.findAllActive();
        
        data.put("totalAssignmentsToday", tasks.size());
        data.put("completedToday", tasks.stream().filter(t -> t.getStatus() == DailyWorkAssignment.Status.COMPLETED).count());
        data.put("inProgress", tasks.stream().filter(t -> t.getStatus() == DailyWorkAssignment.Status.IN_PROGRESS).count());
        data.put("blocked", tasks.stream().filter(t -> t.getStatus() == DailyWorkAssignment.Status.BLOCKED).count());
        data.put("employeesOnBreak", breaks.size());
        return data;
    }

    // ================== HELPERS ==================

    private DailyWorkAssignment getAssignmentEntity(Long id) {
        return assignmentRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Task", "id", id));
    }

    private AssignmentResponse mapToResponse(DailyWorkAssignment a) {
        String projName = a.getProjectId() != null ? projectRepository.findById(a.getProjectId()).map(Project::getName).orElse(null) : null;
        
        return AssignmentResponse.builder()
                .id(a.getId())
                .assignmentNumber(a.getAssignmentNumber())
                .employeeId(a.getEmployee().getId())
                .employeeName(a.getEmployee().getFullName())
                .employeeCode(a.getEmployee().getEmployeeId())
                .title(a.getTitle())
                .description(a.getDescription())
                .category(a.getCategory().name())
                .priority(a.getPriority().name())
                .status(a.getStatus().name())
                .assignmentDate(a.getAssignmentDate())
                .dueDate(a.getDueDate())
                .dueTime(a.getDueTime())
                .estimatedHours(a.getEstimatedHours())
                .actualHours(a.getActualHours())
                .progressPercentage(a.getProgressPercentage())
                .projectId(a.getProjectId())
                .projectName(projName)
                .blockerReason(a.getBlockerReason())
                .completionNotes(a.getCompletionNotes())
                .acceptedAt(a.getAcceptedAt())
                .startedAt(a.getStartedAt())
                .pausedAt(a.getPausedAt())
                .resumedAt(a.getResumedAt())
                .completedAt(a.getCompletedAt())
                .totalActiveSeconds(a.getTotalActiveSeconds())
                .totalPauseSeconds(a.getTotalPauseSeconds())
                .currentElapsedSeconds(a.getCurrentElapsedSeconds())
                .pauseCount(a.getPauseCount())
                .isOverdue(a.isOverdue())
                .build();
    }

    private BreakSessionResponse mapBreak(BreakSession b) {
        return BreakSessionResponse.builder()
                .id(b.getId())
                .employeeId(b.getEmployee().getId())
                .employeeName(b.getEmployee().getFullName())
                .breakType(b.getBreakType().name())
                .startTime(b.getStartTime())
                .endTime(b.getEndTime())
                .durationMinutes(b.getDurationMinutes())
                .currentDurationMinutes(b.getCurrentDurationMinutes())
                .maxAllowedMinutes(b.getMaxAllowedMinutes())
                .isExceeded(b.getIsExceeded())
                .reason(b.getReason())
                .status(b.getStatus().name())
                .build();
    }
}