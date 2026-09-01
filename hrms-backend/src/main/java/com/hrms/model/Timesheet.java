
//model/Timesheet.java
package com.hrms.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "timesheets")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Timesheet {

 @Id
 @GeneratedValue(strategy = GenerationType.IDENTITY)
 private Long id;

 @ManyToOne(fetch = FetchType.LAZY)
 @JoinColumn(name = "employee_id", nullable = false)
 private Employee employee;

 @ManyToOne(fetch = FetchType.LAZY)
 @JoinColumn(name = "project_id", nullable = false)
 private Project project;

 @Column(name = "task_id")
 private Long taskId;

 @Column(name = "work_date", nullable = false)
 private LocalDate workDate;

 @Column(name = "hours_worked", nullable = false, precision = 4, scale = 2)
 private BigDecimal hoursWorked;

 @Column(columnDefinition = "TEXT")
 private String description;

 @Column(name = "is_billable")
 private Boolean isBillable = true;

 @Enumerated(EnumType.STRING)
 private Status status = Status.DRAFT;

 @Column(name = "approved_by")
 private Long approvedBy;

 @Column(name = "approved_at")
 private LocalDateTime approvedAt;

 @Column(name = "rejection_reason", columnDefinition = "TEXT")
 private String rejectionReason;

 @CreationTimestamp
 @Column(name = "created_at", updatable = false)
 private LocalDateTime createdAt;

 @UpdateTimestamp
 @Column(name = "updated_at")
 private LocalDateTime updatedAt;

 public enum Status { DRAFT, SUBMITTED, APPROVED, REJECTED }
}