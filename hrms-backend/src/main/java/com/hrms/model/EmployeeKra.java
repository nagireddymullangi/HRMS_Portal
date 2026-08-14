
//model/EmployeeKra.java
package com.hrms.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "employee_kras")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class EmployeeKra {

 @Id
 @GeneratedValue(strategy = GenerationType.IDENTITY)
 private Long id;

 @ManyToOne(fetch = FetchType.LAZY)
 @JoinColumn(name = "employee_id", nullable = false)
 private Employee employee;

 @ManyToOne(fetch = FetchType.LAZY)
 @JoinColumn(name = "cycle_id", nullable = false)
 private PerformanceCycle cycle;

 @Column(nullable = false, length = 255)
 private String title;

 @Column(columnDefinition = "TEXT")
 private String description;

 private Integer weightage = 0;

 @Column(length = 500)
 private String target;

 @Column(length = 500)
 private String achieved;

 @Column(name = "self_rating")
 private Integer selfRating;

 @Column(name = "manager_rating")
 private Integer managerRating;

 @Column(name = "self_comments", columnDefinition = "TEXT")
 private String selfComments;

 @Column(name = "manager_comments", columnDefinition = "TEXT")
 private String managerComments;

 @Column(name = "final_rating")
 private Integer finalRating;

 @Enumerated(EnumType.STRING)
 private Status status = Status.DRAFT;

 @CreationTimestamp
 @Column(name = "created_at", updatable = false)
 private LocalDateTime createdAt;

 @UpdateTimestamp
 @Column(name = "updated_at")
 private LocalDateTime updatedAt;

 public enum Status {
     DRAFT, SELF_REVIEW, MANAGER_REVIEW, COMPLETED
 }
}
