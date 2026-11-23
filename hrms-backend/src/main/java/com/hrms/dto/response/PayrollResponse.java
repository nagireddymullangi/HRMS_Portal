//dto/response/PayrollResponse.java
package com.hrms.dto.response;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PayrollResponse {
 private Long id;
 private Long employeeId;
 private String employeeName;
 private String employeeCode;
 private String departmentName;
 private String designation;
 private Integer month;
 private Integer year;

 // Earnings
 private BigDecimal basicSalary;
 private BigDecimal basicPay;
 private BigDecimal hra;
 private BigDecimal transportAllowance;
 private BigDecimal medicalAllowance;
 private BigDecimal otherAllowances;
 private BigDecimal grossSalary;

 // Employee Deductions
 private BigDecimal pfDeduction;
 private BigDecimal pfEmployee;
 private BigDecimal esiDeduction;
 private BigDecimal esiEmployee;
 private BigDecimal professionalTax;
 private BigDecimal taxDeduction;
 private BigDecimal otherDeductions;
 private BigDecimal totalDeductions;
 private BigDecimal netSalary;

 // Employer Statutory Contributions & CTC
 private BigDecimal pfEmployer;
 private BigDecimal esiEmployer;
 private BigDecimal totalEmployerContribution;
 private BigDecimal ctc;

 // Attendance & Status
 private Integer workingDays;
 private Integer presentDays;
 private String status;
 private LocalDateTime generatedAt;
 private LocalDateTime paidAt;
}
