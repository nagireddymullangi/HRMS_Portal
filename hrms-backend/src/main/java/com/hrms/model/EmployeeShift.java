
//model/EmployeeShift.java
package com.hrms.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "employee_shifts")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class EmployeeShift {

 @Id
 @GeneratedValue(strategy = GenerationType.IDENTITY)
 private Long id;

 @ManyToOne(fetch = FetchType.LAZY)
 @JoinColumn(name = "employee_id", nullable = false)
 private Employee employee;

 @ManyToOne(fetch = FetchType.LAZY)
 @JoinColumn(name = "shift_id", nullable = false)
 private Shift shift;

 @Column(name = "effective_from", nullable = false)
 private LocalDate effectiveFrom;

 @Column(name = "effective_to")
 private LocalDate effectiveTo;

 @Column(name = "is_active")
 private Boolean isActive = true;

 @CreationTimestamp
 @Column(name = "created_at", updatable = false)
 private LocalDateTime createdAt;
}