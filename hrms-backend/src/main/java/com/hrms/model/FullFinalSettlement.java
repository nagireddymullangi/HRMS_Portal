
//model/FullFinalSettlement.java
package com.hrms.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "full_final_settlements")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class FullFinalSettlement {

 @Id
 @GeneratedValue(strategy = GenerationType.IDENTITY)
 private Long id;

 @Column(name = "settlement_number", unique = true, nullable = false, length = 50)
 private String settlementNumber;

 @ManyToOne(fetch = FetchType.LAZY)
 @JoinColumn(name = "employee_id", nullable = false)
 private Employee employee;

 @Column(name = "exit_id")
 private Long exitId;

 @Column(name = "last_working_date", nullable = false)
 private LocalDate lastWorkingDate;

 @Column(name = "settlement_date")
 private LocalDate settlementDate;

 // Earnings
 @Column(name = "pending_salary", precision = 12, scale = 2)
 private BigDecimal pendingSalary = BigDecimal.ZERO;

 @Column(name = "pending_bonus", precision = 12, scale = 2)
 private BigDecimal pendingBonus = BigDecimal.ZERO;

 @Column(name = "leave_encashment", precision = 12, scale = 2)
 private BigDecimal leaveEncashment = BigDecimal.ZERO;

 @Column(name = "leave_encashment_days")
 private Integer leaveEncashmentDays = 0;

 @Column(precision = 12, scale = 2)
 private BigDecimal gratuity = BigDecimal.ZERO;

 @Column(name = "notice_period_recovery", precision = 12, scale = 2)
 private BigDecimal noticePeriodRecovery = BigDecimal.ZERO;

 @Column(name = "other_earnings", precision = 12, scale = 2)
 private BigDecimal otherEarnings = BigDecimal.ZERO;

 @Column(name = "other_earnings_note", columnDefinition = "TEXT")
 private String otherEarningsNote;

 // Deductions
 @Column(name = "tax_deduction", precision = 12, scale = 2)
 private BigDecimal taxDeduction = BigDecimal.ZERO;

 @Column(name = "pf_deduction", precision = 12, scale = 2)
 private BigDecimal pfDeduction = BigDecimal.ZERO;

 @Column(name = "loan_recovery", precision = 12, scale = 2)
 private BigDecimal loanRecovery = BigDecimal.ZERO;

 @Column(name = "advance_recovery", precision = 12, scale = 2)
 private BigDecimal advanceRecovery = BigDecimal.ZERO;

 @Column(name = "asset_recovery", precision = 12, scale = 2)
 private BigDecimal assetRecovery = BigDecimal.ZERO;

 @Column(name = "asset_recovery_note", columnDefinition = "TEXT")
 private String assetRecoveryNote;

 @Column(name = "other_deductions", precision = 12, scale = 2)
 private BigDecimal otherDeductions = BigDecimal.ZERO;

 @Column(name = "other_deductions_note", columnDefinition = "TEXT")
 private String otherDeductionsNote;

 // Totals
 @Column(name = "total_earnings", precision = 12, scale = 2)
 private BigDecimal totalEarnings = BigDecimal.ZERO;

 @Column(name = "total_deductions", precision = 12, scale = 2)
 private BigDecimal totalDeductions = BigDecimal.ZERO;

 @Column(name = "net_settlement", precision = 12, scale = 2)
 private BigDecimal netSettlement = BigDecimal.ZERO;

 @Enumerated(EnumType.STRING)
 private Status status = Status.DRAFT;

 @Enumerated(EnumType.STRING)
 @Column(name = "payment_mode")
 private PaymentMode paymentMode = PaymentMode.BANK_TRANSFER;

 @Column(name = "payment_reference", length = 100)
 private String paymentReference;

 @Column(name = "paid_at")
 private LocalDateTime paidAt;

 @Column(name = "approved_by")
 private Long approvedBy;

 @Column(name = "approved_at")
 private LocalDateTime approvedAt;

 @Column(columnDefinition = "TEXT")
 private String notes;

 @Column(name = "created_by")
 private Long createdBy;

 @CreationTimestamp
 @Column(name = "created_at", updatable = false)
 private LocalDateTime createdAt;

 @UpdateTimestamp
 @Column(name = "updated_at")
 private LocalDateTime updatedAt;

 public enum Status {
     DRAFT, PENDING_APPROVAL, APPROVED, PAID, ON_HOLD, CANCELLED
 }

 public enum PaymentMode {
     BANK_TRANSFER, CHEQUE, CASH
 }

 // Auto-calculate totals
 public void calculateTotals() {
     this.totalEarnings = pendingSalary.add(pendingBonus)
             .add(leaveEncashment).add(gratuity)
             .add(otherEarnings);

     this.totalDeductions = taxDeduction.add(pfDeduction)
             .add(loanRecovery).add(advanceRecovery)
             .add(assetRecovery).add(noticePeriodRecovery)
             .add(otherDeductions);

     this.netSettlement = totalEarnings.subtract(totalDeductions);
 }
}