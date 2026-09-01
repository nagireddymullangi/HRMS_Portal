
//dto/response/ExpenseClaimResponse.java
package com.hrms.dto.response;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ExpenseClaimResponse {
 private Long id;
 private String claimNumber;
 private Long employeeId;
 private String employeeName;
 private String employeeCode;
 private Long categoryId;
 private String categoryName;
 private Long projectId;
 private String projectName;
 private LocalDate expenseDate;
 private BigDecimal amount;
 private String currency;
 private String description;
 private String vendor;
 private String paymentMethod;
 private String receiptUrl;
 private String status;
 private LocalDateTime submittedAt;
 private Long approvedBy;
 private LocalDateTime approvedAt;
 private String rejectedReason;
 private LocalDateTime reimbursedAt;
 private BigDecimal reimbursedAmount;
 private String notes;
 private LocalDateTime createdAt;
}