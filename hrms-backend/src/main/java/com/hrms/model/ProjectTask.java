
//model/ProjectTask.java
package com.hrms.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "project_tasks")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ProjectTask {

 @Id
 @GeneratedValue(strategy = GenerationType.IDENTITY)
 private Long id;

 @ManyToOne(fetch = FetchType.LAZY)
 @JoinColumn(name = "project_id", nullable = false)
 private Project project;

 @Column(name = "task_name", nullable = false, length = 255)
 private String taskName;

 @Column(columnDefinition = "TEXT")
 private String description;

 @Column(name = "assigned_to")
 private Long assignedTo;

 @Enumerated(EnumType.STRING)
 private Priority priority = Priority.MEDIUM;

 @Enumerated(EnumType.STRING)
 private Status status = Status.TODO;

 @Column(name = "estimated_hours", precision = 6, scale = 2)
 private BigDecimal estimatedHours;

 @Column(name = "actual_hours", precision = 6, scale = 2)
 private BigDecimal actualHours = BigDecimal.ZERO;

 @Column(name = "start_date")
 private LocalDate startDate;

 @Column(name = "due_date")
 private LocalDate dueDate;

 @Column(name = "completed_date")
 private LocalDate completedDate;

 @CreationTimestamp
 @Column(name = "created_at", updatable = false)
 private LocalDateTime createdAt;

 public enum Priority { LOW, MEDIUM, HIGH, URGENT }
 public enum Status { TODO, IN_PROGRESS, REVIEW, DONE, CANCELLED }
}