//dto/request/PayrollRequest.java
package com.hrms.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.*;
import java.math.BigDecimal;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PayrollRequest {

 @NotNull
 private Long employeeId;

 @NotNull
 private Integer month;

 @NotNull
 private Integer year;

 // Earnings
 private BigDecimal basicSalary;
 private BigDecimal basicPay;
 private BigDecimal hra;
 private BigDecimal transportAllowance;
 private BigDecimal medicalAllowance;
 private BigDecimal otherAllowances;

 // Employee Deductions
 private BigDecimal pfDeduction;
 private BigDecimal pfEmployee;
 private BigDecimal esiDeduction;
 private BigDecimal esiEmployee;
 private BigDecimal professionalTax;
 private BigDecimal taxDeduction;
 private BigDecimal otherDeductions;

 // Employer Statutory Contributions
 private BigDecimal pfEmployer;
 private BigDecimal esiEmployer;

 // Helper getters to resolve aliases
 public BigDecimal getResolvedBasicSalary() {
     return basicSalary != null ? basicSalary : basicPay;
 }

 public BigDecimal getResolvedPfEmployee() {
     return pfDeduction != null ? pfDeduction : pfEmployee;
 }

 public BigDecimal getResolvedEsiEmployee() {
     return esiDeduction != null ? esiDeduction : esiEmployee;
 }
}
