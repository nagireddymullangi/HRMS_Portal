
//dto/response/EmployeeExitResponse.java
package com.hrms.dto.response;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class EmployeeExitResponse {
 private Long id;
 private Long employeeId;
 private String employeeName;
 private String employeeCode;
 private String designation;
 private String departmentName;
 private LocalDate dateOfJoining;
 private LocalDate resignationDate;
 private LocalDate lastWorkingDate;
 private Integer noticePeriodDays;
 private String reason;
 private String detailedReason;
 private String status;
 private LocalDateTime approvedAt;
 private Boolean itClearance;
 private Boolean hrClearance;
 private Boolean financeClearance;
 private Boolean managerClearance;
 private Boolean adminClearance;
 private Integer clearanceProgress;
 private BigDecimal finalSettlementAmount;
 private Boolean settlementPaid;
 private LocalDate settlementDate;
 private Boolean exitInterviewCompleted;
 private String exitInterviewNotes;
 private Boolean experienceLetterIssued;
 private LocalDate experienceLetterDate;
 private Boolean rehireEligible;
 private LocalDateTime createdAt;
}