
//model/EmployeeExit.java
package com.hrms.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "employee_exits")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class EmployeeExit {

 @Id
 @GeneratedValue(strategy = GenerationType.IDENTITY)
 private Long id;

 @ManyToOne(fetch = FetchType.LAZY)
 @JoinColumn(name = "employee_id", nullable = false)
 private Employee employee;

 @Column(name = "resignation_date", nullable = false)
 private LocalDate resignationDate;

 @Column(name = "last_working_date", nullable = false)
 private LocalDate lastWorkingDate;

 @Column(name = "notice_period_days")
 private Integer noticePeriodDays = 30;

 @Enumerated(EnumType.STRING)
 @Column(nullable = false)
 private ExitReason reason;

 @Column(name = "detailed_reason", columnDefinition = "TEXT")
 private String detailedReason;

 @Enumerated(EnumType.STRING)
 private Status status = Status.PENDING;

 @Column(name = "approved_by")
 private Long approvedBy;

 @Column(name = "approved_at")
 private LocalDateTime approvedAt;

 // Clearances
 @Column(name = "it_clearance")
 private Boolean itClearance = false;

 @Column(name = "hr_clearance")
 private Boolean hrClearance = false;

 @Column(name = "finance_clearance")
 private Boolean financeClearance = false;

 @Column(name = "manager_clearance")
 private Boolean managerClearance = false;

 @Column(name = "admin_clearance")
 private Boolean adminClearance = false;

 // Settlement
 @Column(name = "final_settlement_amount", precision = 10, scale = 2)
 private BigDecimal finalSettlementAmount;

 @Column(name = "settlement_paid")
 private Boolean settlementPaid = false;

 @Column(name = "settlement_date")
 private LocalDate settlementDate;

 // Exit interview
 @Column(name = "exit_interview_completed")
 private Boolean exitInterviewCompleted = false;

 @Column(name = "exit_interview_notes", columnDefinition = "TEXT")
 private String exitInterviewNotes;

 // Documents
 @Column(name = "experience_letter_issued")
 private Boolean experienceLetterIssued = false;

 @Column(name = "experience_letter_date")
 private LocalDate experienceLetterDate;

 @Column(name = "rehire_eligible")
 private Boolean rehireEligible = true;

 @CreationTimestamp
 @Column(name = "created_at", updatable = false)
 private LocalDateTime createdAt;

 @UpdateTimestamp
 @Column(name = "updated_at")
 private LocalDateTime updatedAt;

 public enum Status {
     PENDING, APPROVED, IN_PROGRESS, COMPLETED, CANCELLED
 }

 public enum ExitReason {
     BETTER_OPPORTUNITY, PERSONAL, RELOCATION, HEALTH,
     HIGHER_STUDIES, RETIREMENT, TERMINATION, OTHER
 }

 // Helper: Calculate clearance progress
 public int getClearanceProgress() {
     int total = 5;
     int completed = 0;
     if (Boolean.TRUE.equals(itClearance)) completed++;
     if (Boolean.TRUE.equals(hrClearance)) completed++;
     if (Boolean.TRUE.equals(financeClearance)) completed++;
     if (Boolean.TRUE.equals(managerClearance)) completed++;
     if (Boolean.TRUE.equals(adminClearance)) completed++;
     return (completed * 100) / total;
 }
}