
//model/OvertimeRecord.java
package com.hrms.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "overtime_records")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class OvertimeRecord {

 @Id
 @GeneratedValue(strategy = GenerationType.IDENTITY)
 private Long id;

 @ManyToOne(fetch = FetchType.LAZY)
 @JoinColumn(name = "employee_id", nullable = false)
 private Employee employee;

 @Column(nullable = false)
 private LocalDate date;

 @Column(nullable = false, precision = 4, scale = 2)
 private BigDecimal hours;

 @Column(name = "rate_multiplier", precision = 3, scale = 2)
 private BigDecimal rateMultiplier = BigDecimal.valueOf(1.5);

 @Column(columnDefinition = "TEXT")
 private String reason;

 @Enumerated(EnumType.STRING)
 private Status status = Status.PENDING;

 @Column(name = "approved_by")
 private Long approvedBy;

 @Column(name = "approved_at")
 private LocalDateTime approvedAt;

 @CreationTimestamp
 @Column(name = "created_at", updatable = false)
 private LocalDateTime createdAt;

 public enum Status { PENDING, APPROVED, REJECTED }
}