
//model/JobApplication.java
package com.hrms.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "job_applications",
    uniqueConstraints = @UniqueConstraint(
        columnNames = {"job_posting_id", "candidate_id"}))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class JobApplication {

 @Id
 @GeneratedValue(strategy = GenerationType.IDENTITY)
 private Long id;

 @Column(name = "application_number", unique = true, nullable = false)
 private String applicationNumber;

 @ManyToOne(fetch = FetchType.LAZY)
 @JoinColumn(name = "job_posting_id", nullable = false)
 private JobPosting jobPosting;

 @ManyToOne(fetch = FetchType.LAZY)
 @JoinColumn(name = "candidate_id", nullable = false)
 private Candidate candidate;

 @Enumerated(EnumType.STRING)
 private Stage stage = Stage.APPLIED;

 @Enumerated(EnumType.STRING)
 private Status status = Status.ACTIVE;

 @Column(name = "cover_letter", columnDefinition = "TEXT")
 private String coverLetter;

 @CreationTimestamp
 @Column(name = "applied_date", updatable = false)
 private LocalDateTime appliedDate;

 @Column(name = "reviewed_by")
 private Long reviewedBy;

 @Column(precision = 3, scale = 1)
 private BigDecimal rating;

 @Column(columnDefinition = "TEXT")
 private String notes;

 @Column(name = "rejection_reason", columnDefinition = "TEXT")
 private String rejectionReason;

 public enum Stage {
     APPLIED, SCREENING, SHORTLISTED, INTERVIEW_SCHEDULED,
     INTERVIEWED, OFFERED, HIRED, REJECTED, WITHDRAWN
 }

 public enum Status { ACTIVE, ON_HOLD, CLOSED }
}