
//model/Attendance.java
package com.hrms.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
@Table(name = "attendance",
    uniqueConstraints = @UniqueConstraint(
        columnNames = {"employee_id", "date"}))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Attendance {

 @Id
 @GeneratedValue(strategy = GenerationType.IDENTITY)
 private Long id;

 @ManyToOne(fetch = FetchType.LAZY)
 @JoinColumn(name = "employee_id", nullable = false)
 private Employee employee;

 @Column(nullable = false)
 private LocalDate date;

 @Column(name = "check_in")
 private LocalTime checkIn;

 @Column(name = "check_out")
 private LocalTime checkOut;

 @Enumerated(EnumType.STRING)
 private Status status = Status.ABSENT;

 @Column(name = "working_hours")
 private Double workingHours;

 @Column(columnDefinition = "TEXT")
 private String notes;

 @CreationTimestamp
 @Column(name = "created_at", updatable = false)
 private LocalDateTime createdAt;

 @UpdateTimestamp
 @Column(name = "updated_at")
 private LocalDateTime updatedAt;

 public enum Status { PRESENT, ABSENT, HALF_DAY, ON_LEAVE }
}