
//model/Project.java
package com.hrms.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "projects")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Project {

 @Id
 @GeneratedValue(strategy = GenerationType.IDENTITY)
 private Long id;

 @Column(name = "project_code", unique = true, nullable = false)
 private String projectCode;

 @Column(nullable = false, length = 255)
 private String name;

 @Column(columnDefinition = "TEXT")
 private String description;

 @Column(name = "client_name", length = 200)
 private String clientName;

 @Column(name = "project_manager_id")
 private Long projectManagerId;

 @Column(name = "start_date")
 private LocalDate startDate;

 @Column(name = "end_date")
 private LocalDate endDate;

 @Column(name = "estimated_hours", precision = 10, scale = 2)
 private BigDecimal estimatedHours;

 @Column(name = "actual_hours", precision = 10, scale = 2)
 private BigDecimal actualHours = BigDecimal.ZERO;

 @Column(precision = 15, scale = 2)
 private BigDecimal budget;

 @Enumerated(EnumType.STRING)
 private Status status = Status.PLANNED;

 @Enumerated(EnumType.STRING)
 private Priority priority = Priority.MEDIUM;

 @Column(length = 20)
 private String color = "#3b82f6";

 @Column(name = "is_billable")
 private Boolean isBillable = true;

 @Column(name = "hourly_rate", precision = 10, scale = 2)
 private BigDecimal hourlyRate;

 @Column(name = "created_by")
 private Long createdBy;

 @CreationTimestamp
 @Column(name = "created_at", updatable = false)
 private LocalDateTime createdAt;

 @UpdateTimestamp
 @Column(name = "updated_at")
 private LocalDateTime updatedAt;

 public enum Status { PLANNED, ACTIVE, ON_HOLD, COMPLETED, CANCELLED }
 public enum Priority { LOW, MEDIUM, HIGH, CRITICAL }
}