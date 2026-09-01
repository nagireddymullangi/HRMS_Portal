
//dto/response/FnFSettlementResponse.java
package com.hrms.dto.response;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class FnFSettlementResponse {
 private Long id;
 private String settlementNumber;
 private Long employeeId;
 private String employeeName;
 private String employeeCode;
 private String designation;
 private String departmentName;
 private LocalDate dateOfJoining;
 private LocalDate lastWorkingDate;
 private LocalDate settlementDate;

 // Earnings
 private BigDecimal pendingSalary;
 private BigDecimal pendingBonus;
 private BigDecimal leaveEncashment;
 private Integer leaveEncashmentDays;
 private BigDecimal gratuity;
 private BigDecimal noticePeriodRecovery;
 private BigDecimal otherEarnings;
 private String otherEarningsNote;

 // Deductions
 private BigDecimal taxDeduction;
 private BigDecimal pfDeduction;
 private BigDecimal loanRecovery;
 private BigDecimal advanceRecovery;
 private BigDecimal assetRecovery;
 private String assetRecoveryNote;
 private BigDecimal otherDeductions;
 private String otherDeductionsNote;

 // Totals
 private BigDecimal totalEarnings;
 private BigDecimal totalDeductions;
 private BigDecimal netSettlement;

 private String status;
 private String paymentMode;
 private String paymentReference;
 private LocalDateTime paidAt;
 private LocalDateTime approvedAt;
 private String notes;
 private LocalDateTime createdAt;
}