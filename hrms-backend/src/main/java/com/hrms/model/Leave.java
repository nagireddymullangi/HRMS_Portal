//model/Leave.java
package com.hrms.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "leaves")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Leave {

 @Id
 @GeneratedValue(strategy = GenerationType.IDENTITY)
 private Long id;

 @ManyToOne(fetch = FetchType.LAZY)
 @JoinColumn(name = "employee_id", nullable = false)
 private Employee employee;

 @ManyToOne(fetch = FetchType.LAZY)
 @JoinColumn(name = "leave_type_id", nullable = false)
 private LeaveType leaveType;

 @Column(name = "start_date", nullable = false)
 private LocalDate startDate;

 @Column(name = "end_date", nullable = false)
 private LocalDate endDate;

 @Column(name = "total_days", nullable = false)
 private Integer totalDays;

 @Column(columnDefinition = "TEXT")
 private String reason;

 @Enumerated(EnumType.STRING)
 private Status status = Status.PENDING;

 @Column(name = "admin_comment", columnDefinition = "TEXT")
 private String adminComment;

 @CreationTimestamp
 @Column(name = "applied_at", updatable = false)
 private LocalDateTime appliedAt;

 @UpdateTimestamp
 @Column(name = "updated_at")
 private LocalDateTime updatedAt;

 public enum Status { PENDING, APPROVED, REJECTED }
}