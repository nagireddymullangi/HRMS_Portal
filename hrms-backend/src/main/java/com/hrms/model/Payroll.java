
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

 @Column(name = "basic_salary", precision = 10, scale = 2)
 private BigDecimal basicSalary = BigDecimal.ZERO;

 @Column(precision = 10, scale = 2)
 private BigDecimal hra = BigDecimal.ZERO;

 @Column(name = "transport_allowance", precision = 10, scale = 2)
 private BigDecimal transportAllowance = BigDecimal.ZERO;

 @Column(name = "medical_allowance", precision = 10, scale = 2)
 private BigDecimal medicalAllowance = BigDecimal.ZERO;

 @Column(name = "other_allowances", precision = 10, scale = 2)
 private BigDecimal otherAllowances = BigDecimal.ZERO;

 @Column(name = "gross_salary", precision = 10, scale = 2)
 private BigDecimal grossSalary = BigDecimal.ZERO;

 @Column(name = "pf_deduction", precision = 10, scale = 2)
 private BigDecimal pfDeduction = BigDecimal.ZERO;

 @Column(name = "tax_deduction", precision = 10, scale = 2)
 private BigDecimal taxDeduction = BigDecimal.ZERO;

 @Column(name = "other_deductions", precision = 10, scale = 2)
 private BigDecimal otherDeductions = BigDecimal.ZERO;

 @Column(name = "total_deductions", precision = 10, scale = 2)
 private BigDecimal totalDeductions = BigDecimal.ZERO;

 @Column(name = "net_salary", precision = 10, scale = 2)
 private BigDecimal netSalary = BigDecimal.ZERO;

 @Column(name = "working_days")
 private Integer workingDays = 0;

 @Column(name = "present_days")
 private Integer presentDays = 0;

 @Enumerated(EnumType.STRING)
 private Status status = Status.GENERATED;

 @CreationTimestamp
 @Column(name = "generated_at", updatable = false)
 private LocalDateTime generatedAt;

 @Column(name = "paid_at")
 private LocalDateTime paidAt;

 public enum Status { GENERATED, PAID }
}