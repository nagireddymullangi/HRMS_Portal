
//dto/request/OfferLetterRequest.java
package com.hrms.dto.request;

import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class OfferLetterRequest {

 @NotBlank(message = "Candidate name is required")
 private String candidateName;

 @NotBlank(message = "Email is required")
 @Email(message = "Invalid email format")
 private String candidateEmail;

 private String candidatePhone;

 @NotBlank(message = "Position is required")
 private String position;

 private Long departmentId;

 @NotNull(message = "Salary is required")
 private BigDecimal offeredSalary;

 @NotNull(message = "Joining date is required")
 private LocalDate joiningDate;

 @NotNull(message = "Expiry date is required")
 private LocalDate expiryDate;

 private String reportingManager;
 private String workLocation;
 private String employmentType;
 private String additionalTerms;
}