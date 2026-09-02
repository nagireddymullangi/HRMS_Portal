
//dto/response/AssignmentResponse.java
package com.hrms.dto.response;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class AssignmentResponse {
 private Long id;
 private String assignmentNumber;
 private Long employeeId;
 private String employeeName;
 private String employeeCode;
 private Long assignedBy;
 private String assignedByName;
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
 private BigDecimal remainingHours;
 private Integer progressPercentage;
 private Long projectId;
 private String projectName;
 private String tags;
 private String attachments;
 private String blockerReason;
 private String completionNotes;
 private LocalDateTime startedAt;
 private LocalDateTime completedAt;
 private Boolean isOverdue;
 private Boolean isRecurring;
 private Long totalComments;
 private LocalDateTime createdAt;
 private LocalDateTime updatedAt;
}