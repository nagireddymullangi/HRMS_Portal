
//model/OnboardingTask.java
package com.hrms.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "onboarding_tasks")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class OnboardingTask {

 @Id
 @GeneratedValue(strategy = GenerationType.IDENTITY)
 private Long id;

 @ManyToOne(fetch = FetchType.LAZY)
 @JoinColumn(name = "onboarding_id", nullable = false)
 private OnboardingProcess onboarding;

 @Column(name = "task_name", nullable = false, length = 255)
 private String taskName;

 @Column(columnDefinition = "TEXT")
 private String description;

 @Enumerated(EnumType.STRING)
 private Category category = Category.OTHER;

 @Column(name = "assigned_to")
 private Long assignedTo;

 @Column(name = "due_date")
 private LocalDate dueDate;

 @Enumerated(EnumType.STRING)
 private Status status = Status.PENDING;

 @Column(name = "completed_at")
 private LocalDateTime completedAt;

 @Enumerated(EnumType.STRING)
 private Priority priority = Priority.MEDIUM;

 @Column(name = "is_required")
 private Boolean isRequired = true;

 @Column(name = "document_url", length = 500)
 private String documentUrl;

 @Column(columnDefinition = "TEXT")
 private String notes;

 @CreationTimestamp
 @Column(name = "created_at", updatable = false)
 private LocalDateTime createdAt;

 public enum Category {
     DOCUMENT, ORIENTATION, IT_SETUP, TRAINING,
     PAPERWORK, COMPLIANCE, OTHER
 }

 public enum Status { PENDING, IN_PROGRESS, COMPLETED, SKIPPED }
 public enum Priority { LOW, MEDIUM, HIGH }
}