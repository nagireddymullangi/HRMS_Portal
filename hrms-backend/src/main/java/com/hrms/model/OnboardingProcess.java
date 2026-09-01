
//model/OnboardingProcess.java
package com.hrms.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "onboarding_process")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class OnboardingProcess {

 @Id
 @GeneratedValue(strategy = GenerationType.IDENTITY)
 private Long id;

 @OneToOne(fetch = FetchType.LAZY)
 @JoinColumn(name = "employee_id", nullable = false, unique = true)
 private Employee employee;

 @Column(name = "offer_letter_id")
 private Long offerLetterId;

 @Column(name = "start_date", nullable = false)
 private LocalDate startDate;

 @Column(name = "expected_completion_date")
 private LocalDate expectedCompletionDate;

 @Column(name = "actual_completion_date")
 private LocalDate actualCompletionDate;

 @Enumerated(EnumType.STRING)
 private Status status = Status.INITIATED;

 @Column(name = "assigned_hr_id")
 private Long assignedHrId;

 @Column(name = "assigned_manager_id")
 private Long assignedManagerId;

 @Column(name = "completion_percentage")
 private Integer completionPercentage = 0;

 @Column(columnDefinition = "TEXT")
 private String notes;

 @OneToMany(mappedBy = "onboarding", cascade = CascadeType.ALL,
            orphanRemoval = true, fetch = FetchType.LAZY)
 @Builder.Default
 private List<OnboardingTask> tasks = new ArrayList<>();

 @CreationTimestamp
 @Column(name = "created_at", updatable = false)
 private LocalDateTime createdAt;

 @UpdateTimestamp
 @Column(name = "updated_at")
 private LocalDateTime updatedAt;

 public enum Status {
     INITIATED, IN_PROGRESS, COMPLETED, ON_HOLD, CANCELLED
 }
}