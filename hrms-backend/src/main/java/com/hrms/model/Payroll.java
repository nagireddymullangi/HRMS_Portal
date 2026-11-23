//model/Payroll.java
package com.hrms.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "payroll",
    uniqueConstraints = @UniqueConstraint(
        columnNames = {"employee_id", "month", "year"}))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Payroll {

 @Id
 @GeneratedValue(strategy = GenerationType.IDENTITY)
 private Long id;

 @ManyToOne(fetch = FetchType.LAZY)
 @JoinColumn(name = "employee_id", nullable = false)
 private Employee employee;

 @Column(nullable = false)
 private Integer month;

 @Column(nullable = false)
 private Integer year;

 // --- Earnings ---
 @Column(name = "basic_salary", precision = 10, scale = 2)
 @Builder.Default
 private BigDecimal basicSalary = BigDecimal.ZERO;

 @Column(precision = 10, scale = 2)
 @Builder.Default
 private BigDecimal hra = BigDecimal.ZERO;

 @Column(name = "transport_allowance", precision = 10, scale = 2)
 @Builder.Default
 private BigDecimal transportAllowance = BigDecimal.ZERO;

 @Column(name = "medical_allowance", precision = 10, scale = 2)
 @Builder.Default
 private BigDecimal medicalAllowance = BigDecimal.ZERO;

 @Column(name = "other_allowances", precision = 10, scale = 2)
 @Builder.Default
 private BigDecimal otherAllowances = BigDecimal.ZERO;

 @Column(name = "gross_salary", precision = 10, scale = 2)
 @Builder.Default
 private BigDecimal grossSalary = BigDecimal.ZERO;

 // --- Employee Deductions ---
 @Column(name = "pf_deduction", precision = 10, scale = 2)
 @Builder.Default
 private BigDecimal pfDeduction = BigDecimal.ZERO;

 @Column(name = "esi_deduction", precision = 10, scale = 2)
 @Builder.Default
 private BigDecimal esiDeduction = BigDecimal.ZERO;

 @Column(name = "professional_tax", precision = 10, scale = 2)
 @Builder.Default
 private BigDecimal professionalTax = BigDecimal.ZERO;

 @Column(name = "tax_deduction", precision = 10, scale = 2)
 @Builder.Default
 private BigDecimal taxDeduction = BigDecimal.ZERO;

 @Column(name = "other_deductions", precision = 10, scale = 2)
 @Builder.Default
 private BigDecimal otherDeductions = BigDecimal.ZERO;

 @Column(name = "total_deductions", precision = 10, scale = 2)
 @Builder.Default
 private BigDecimal totalDeductions = BigDecimal.ZERO;

 @Column(name = "net_salary", precision = 10, scale = 2)
 @Builder.Default
 private BigDecimal netSalary = BigDecimal.ZERO;

 // --- Employer Statutory Contributions ---
 @Column(name = "pf_employer", precision = 10, scale = 2)
 @Builder.Default
 private BigDecimal pfEmployer = BigDecimal.ZERO;

 @Column(name = "esi_employer", precision = 10, scale = 2)
 @Builder.Default
 private BigDecimal esiEmployer = BigDecimal.ZERO;

 @Column(name = "total_employer_contribution", precision = 10, scale = 2)
 @Builder.Default
 private BigDecimal totalEmployerContribution = BigDecimal.ZERO;

 @Column(name = "ctc", precision = 10, scale = 2)
 @Builder.Default
 private BigDecimal ctc = BigDecimal.ZERO;

 // --- Attendance & Status ---
 @Column(name = "working_days")
 @Builder.Default
 private Integer workingDays = 0;

 @Column(name = "present_days")
 @Builder.Default
 private Integer presentDays = 0;

 @Enumerated(EnumType.STRING)
 @Builder.Default
 private Status status = Status.GENERATED;

 @CreationTimestamp
 @Column(name = "generated_at", updatable = false)
 private LocalDateTime generatedAt;

 @Column(name = "paid_at")
 private LocalDateTime paidAt;

 public enum Status { GENERATED, PAID }

 // Convenience Aliases for BasicPay, Employee PF & ESI
 public BigDecimal getBasicPay() {
     return basicSalary;
 }

 public void setBasicPay(BigDecimal basicPay) {
     this.basicSalary = basicPay;
 }

 public BigDecimal getPfEmployee() {
     return pfDeduction;
 }

 public void setPfEmployee(BigDecimal pfEmployee) {
     this.pfDeduction = pfEmployee;
 }

 public BigDecimal getEsiEmployee() {
     return esiDeduction;
 }

 public void setEsiEmployee(BigDecimal esiEmployee) {
     this.esiDeduction = esiEmployee;
 }
}
