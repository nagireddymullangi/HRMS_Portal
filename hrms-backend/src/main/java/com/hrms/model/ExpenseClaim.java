
//model/ExpenseClaim.java
package com.hrms.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "expense_claims")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ExpenseClaim {

 @Id
 @GeneratedValue(strategy = GenerationType.IDENTITY)
 private Long id;

 @Column(name = "claim_number", unique = true, nullable = false)
 private String claimNumber;

 @ManyToOne(fetch = FetchType.LAZY)
 @JoinColumn(name = "employee_id", nullable = false)
 private Employee employee;

 @Column(name = "category_id", nullable = false)
 private Long categoryId;

 @Column(name = "project_id")
 private Long projectId;

 @Column(name = "expense_date", nullable = false)
 private LocalDate expenseDate;

 @Column(nullable = false, precision = 10, scale = 2)
 private BigDecimal amount;

 @Column(length = 10)
 private String currency = "INR";

 @Column(columnDefinition = "TEXT")
 private String description;

 @Column(length = 200)
 private String vendor;

 @Enumerated(EnumType.STRING)
 @Column(name = "payment_method")
 private PaymentMethod paymentMethod = PaymentMethod.CASH;

 @Column(name = "receipt_url", length = 500)
 private String receiptUrl;

 @Enumerated(EnumType.STRING)
 private Status status = Status.DRAFT;

 @Column(name = "submitted_at")
 private LocalDateTime submittedAt;

 @Column(name = "approved_by")
 private Long approvedBy;

 @Column(name = "approved_at")
 private LocalDateTime approvedAt;

 @Column(name = "rejected_reason", columnDefinition = "TEXT")
 private String rejectedReason;

 @Column(name = "reimbursed_at")
 private LocalDateTime reimbursedAt;

 @Column(name = "reimbursed_amount", precision = 10, scale = 2)
 private BigDecimal reimbursedAmount;

 @Column(columnDefinition = "TEXT")
 private String notes;

 @CreationTimestamp
 @Column(name = "created_at", updatable = false)
 private LocalDateTime createdAt;

 @UpdateTimestamp
 @Column(name = "updated_at")
 private LocalDateTime updatedAt;

 public enum PaymentMethod {
     CASH, CARD, UPI, BANK_TRANSFER, OTHER
 }

 public enum Status {
     DRAFT, SUBMITTED, APPROVED, REJECTED, REIMBURSED, CANCELLED
 }
}