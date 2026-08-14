
//model/PerformanceCycle.java
package com.hrms.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "performance_cycles")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PerformanceCycle {

 @Id
 @GeneratedValue(strategy = GenerationType.IDENTITY)
 private Long id;

 @Column(nullable = false, length = 150)
 private String name;

 @Column(name = "start_date", nullable = false)
 private LocalDate startDate;

 @Column(name = "end_date", nullable = false)
 private LocalDate endDate;

 @Enumerated(EnumType.STRING)
 private Status status = Status.DRAFT;

 @CreationTimestamp
 @Column(name = "created_at", updatable = false)
 private LocalDateTime createdAt;

 public enum Status { DRAFT, ACTIVE, COMPLETED }
}