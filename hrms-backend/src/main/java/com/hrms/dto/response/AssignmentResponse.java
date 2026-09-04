package com.hrms.dto.response;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class AssignmentResponse {
    private Long id;
    private String assignmentNumber;
    private Long employeeId;
    private String employeeName;
    private String employeeCode;
    private String title;
    private String description;
    private String category;
    private String priority;
    private String status;
    private LocalDate assignmentDate;
    private LocalDate dueDate;
    private LocalTime dueTime;
    private BigDecimal estimatedHours;
    private BigDecimal actualHours;
    private Integer progressPercentage;
    private Long projectId;
    private String projectName;
    private String blockerReason;
    private String completionNotes;
    
    // Time Tracking
    private LocalDateTime acceptedAt;
    private LocalDateTime startedAt;
    private LocalDateTime pausedAt;
    private LocalDateTime resumedAt;
    private LocalDateTime completedAt;
    private Long totalActiveSeconds;
    private Long totalPauseSeconds;
    private Long currentElapsedSeconds;
    private Integer pauseCount;
    
    private Boolean isOverdue;
    private Long totalComments;
}