
//dto/response/OfferLetterResponse.java
package com.hrms.dto.response;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class OfferLetterResponse {
 private Long id;
 private String offerNumber;
 private String candidateName;
 private String candidateEmail;
 private String candidatePhone;
 private String position;
 private Long departmentId;
 private String departmentName;
 private BigDecimal offeredSalary;
 private LocalDate joiningDate;
 private LocalDate offerDate;
 private LocalDate expiryDate;
 private String reportingManager;
 private String workLocation;
 private String employmentType;
 private String additionalTerms;
 private String status;
 private LocalDateTime acceptedAt;
 private LocalDateTime rejectedAt;
 private String rejectionReason;
 private LocalDateTime createdAt;
}