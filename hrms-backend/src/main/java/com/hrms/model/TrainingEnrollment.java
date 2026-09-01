
//model/TrainingEnrollment.java
package com.hrms.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "training_enrollments",
    uniqueConstraints = @UniqueConstraint(
        columnNames = {"program_id", "employee_id"}))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class TrainingEnrollment {

 @Id
 @GeneratedValue(strategy = GenerationType.IDENTITY)
 private Long id;

 @ManyToOne(fetch = FetchType.LAZY)
 @JoinColumn(name = "program_id", nullable = false)
 private TrainingProgram program;

 @ManyToOne(fetch = FetchType.LAZY)
 @JoinColumn(name = "employee_id", nullable = false)
 private Employee employee;

 @CreationTimestamp
 @Column(name = "enrolled_date", updatable = false)
 private LocalDateTime enrolledDate;

 @Enumerated(EnumType.STRING)
 private Status status = Status.ENROLLED;

 @Column(name = "completion_date")
 private LocalDate completionDate;

 @Column(precision = 5, scale = 2)
 private BigDecimal score;

 @Column(length = 10)
 private String grade;

 @Column(name = "certificate_url", length = 500)
 private String certificateUrl;

 @Column(columnDefinition = "TEXT")
 private String feedback;

 private Integer rating;

 public enum Status {
     ENROLLED, IN_PROGRESS, COMPLETED, DROPPED, FAILED
 }
}