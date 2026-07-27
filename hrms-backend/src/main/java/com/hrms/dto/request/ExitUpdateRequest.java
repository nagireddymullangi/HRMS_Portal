
//dto/request/ExitUpdateRequest.java
package com.hrms.dto.request;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class ExitUpdateRequest {
 private String status;
 private Boolean itClearance;
 private Boolean hrClearance;
 private Boolean financeClearance;
 private Boolean managerClearance;
 private Boolean adminClearance;
 private BigDecimal finalSettlementAmount;
 private Boolean settlementPaid;
 private LocalDate settlementDate;
 private Boolean exitInterviewCompleted;
 private String exitInterviewNotes;
 private Boolean experienceLetterIssued;
 private LocalDate experienceLetterDate;
 private Boolean rehireEligible;
}