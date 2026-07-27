
//model/OfferLetter.java
package com.hrms.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "offer_letters")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class OfferLetter {

 @Id
 @GeneratedValue(strategy = GenerationType.IDENTITY)
 private Long id;

 @Column(name = "offer_number", unique = true, nullable = false, length = 50)
 private String offerNumber;

 @Column(name = "candidate_name", nullable = false, length = 150)
 private String candidateName;

 @Column(name = "candidate_email", nullable = false, length = 150)
 private String candidateEmail;

 @Column(name = "candidate_phone", length = 15)
 private String candidatePhone;

 @Column(nullable = false, length = 100)
 private String position;

 @ManyToOne(fetch = FetchType.LAZY)
 @JoinColumn(name = "department_id")
 private Department department;

 @Column(name = "offered_salary", nullable = false, precision = 10, scale = 2)
 private BigDecimal offeredSalary;

 @Column(name = "joining_date", nullable = false)
 private LocalDate joiningDate;

 @Column(name = "offer_date", nullable = false)
 private LocalDate offerDate;

 @Column(name = "expiry_date", nullable = false)
 private LocalDate expiryDate;

 @Column(name = "reporting_manager", length = 150)
 private String reportingManager;

 @Column(name = "work_location", length = 200)
 private String workLocation;

 @Enumerated(EnumType.STRING)
 @Column(name = "employment_type")
 private EmploymentType employmentType = EmploymentType.FULL_TIME;

 @Column(name = "additional_terms", columnDefinition = "TEXT")
 private String additionalTerms;

 @Enumerated(EnumType.STRING)
 private Status status = Status.DRAFT;

 @Column(name = "accepted_at")
 private LocalDateTime acceptedAt;

 @Column(name = "rejected_at")
 private LocalDateTime rejectedAt;

 @Column(name = "rejection_reason", columnDefinition = "TEXT")
 private String rejectionReason;

 @Column(name = "created_by")
 private Long createdBy;

 @CreationTimestamp
 @Column(name = "created_at", updatable = false)
 private LocalDateTime createdAt;

 @UpdateTimestamp
 @Column(name = "updated_at")
 private LocalDateTime updatedAt;

 public enum Status {
     DRAFT, SENT, ACCEPTED, REJECTED, EXPIRED, WITHDRAWN
 }

 public enum EmploymentType {
     FULL_TIME, PART_TIME, CONTRACT, INTERN
 }
}