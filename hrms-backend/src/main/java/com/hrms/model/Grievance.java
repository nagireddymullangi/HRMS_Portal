
//model/Grievance.java
package com.hrms.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "grievances")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Grievance {

 @Id
 @GeneratedValue(strategy = GenerationType.IDENTITY)
 private Long id;

 @Column(name = "ticket_number", unique = true, nullable = false)
 private String ticketNumber;

 @ManyToOne(fetch = FetchType.LAZY)
 @JoinColumn(name = "employee_id", nullable = false)
 private Employee employee;

 @Enumerated(EnumType.STRING)
 @Column(nullable = false)
 private Category category;

 @Column(nullable = false, length = 255)
 private String subject;

 @Column(nullable = false, columnDefinition = "LONGTEXT")
 private String description;

 @Enumerated(EnumType.STRING)
 private Priority priority = Priority.MEDIUM;

 @Column(name = "is_anonymous")
 private Boolean isAnonymous = false;

 @Enumerated(EnumType.STRING)
 private Status status = Status.OPEN;

 @Column(name = "assigned_to")
 private Long assignedTo;

 @Column(columnDefinition = "TEXT")
 private String resolution;

 @Column(name = "resolved_at")
 private LocalDateTime resolvedAt;

 @Column(name = "resolved_by")
 private Long resolvedBy;

 @Column(name = "satisfaction_rating")
 private Integer satisfactionRating;

 @Column(columnDefinition = "TEXT")
 private String feedback;

 @CreationTimestamp
 @Column(name = "created_at", updatable = false)
 private LocalDateTime createdAt;

 @UpdateTimestamp
 @Column(name = "updated_at")
 private LocalDateTime updatedAt;

 public enum Category {
     WORKPLACE, SALARY, HARASSMENT, DISCRIMINATION,
     MANAGEMENT, PEER_CONFLICT, POLICY, FACILITIES, OTHER
 }

 public enum Priority { LOW, MEDIUM, HIGH, CRITICAL }

 public enum Status {
     OPEN, UNDER_REVIEW, IN_PROGRESS, RESOLVED, CLOSED, ESCALATED
 }
}