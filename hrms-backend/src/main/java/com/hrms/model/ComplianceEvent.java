
//model/ComplianceEvent.java
package com.hrms.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "compliance_events")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ComplianceEvent {

 @Id
 @GeneratedValue(strategy = GenerationType.IDENTITY)
 private Long id;

 @Column(nullable = false, length = 255)
 private String title;

 @Column(columnDefinition = "TEXT")
 private String description;

 @Enumerated(EnumType.STRING)
 @Column(name = "compliance_type", nullable = false)
 private ComplianceType complianceType;

 @Column(name = "due_date", nullable = false)
 private LocalDate dueDate;

 @Enumerated(EnumType.STRING)
 private Frequency frequency = Frequency.MONTHLY;

 @Column(name = "reminder_days_before")
 private Integer reminderDaysBefore = 7;

 @Enumerated(EnumType.STRING)
 private Status status = Status.PENDING;

 @Column(name = "completed_date")
 private LocalDate completedDate;

 @Column(name = "completion_notes", columnDefinition = "TEXT")
 private String completionNotes;

 @Column(name = "is_active")
 private Boolean isActive = true;

 @CreationTimestamp
 @Column(name = "created_at", updatable = false)
 private LocalDateTime createdAt;

 @UpdateTimestamp
 @Column(name = "updated_at")
 private LocalDateTime updatedAt;

 public enum ComplianceType {
     PF, ESI, PT, TDS, GRATUITY, INCOME_TAX,
     LWF, GST, ROC, AUDIT, OTHER
 }

 public enum Frequency {
     MONTHLY, QUARTERLY, HALF_YEARLY, ANNUALLY, ONE_TIME
 }

 public enum Status {
     PENDING, IN_PROGRESS, COMPLETED, OVERDUE, SKIPPED
 }

 public boolean isOverdue() {
     return status == Status.PENDING && LocalDate.now().isAfter(dueDate);
 }
}