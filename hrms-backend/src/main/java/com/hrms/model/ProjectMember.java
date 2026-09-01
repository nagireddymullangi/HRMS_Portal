
//model/ProjectMember.java
package com.hrms.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "project_members",
    uniqueConstraints = @UniqueConstraint(
        columnNames = {"project_id", "employee_id"}))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ProjectMember {

 @Id
 @GeneratedValue(strategy = GenerationType.IDENTITY)
 private Long id;

 @ManyToOne(fetch = FetchType.LAZY)
 @JoinColumn(name = "project_id", nullable = false)
 private Project project;

 @ManyToOne(fetch = FetchType.LAZY)
 @JoinColumn(name = "employee_id", nullable = false)
 private Employee employee;

 @Column(length = 100)
 private String role;

 @Column(name = "assigned_date")
 private LocalDate assignedDate;

 @Column(name = "is_active")
 private Boolean isActive = true;

 @CreationTimestamp
 @Column(name = "created_at", updatable = false)
 private LocalDateTime createdAt;
}