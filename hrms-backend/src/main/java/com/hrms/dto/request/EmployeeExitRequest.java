
//dto/request/EmployeeExitRequest.java
package com.hrms.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDate;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class EmployeeExitRequest {

 @NotNull(message = "Employee ID is required")
 private Long employeeId;

 @NotNull(message = "Resignation date is required")
 private LocalDate resignationDate;

 @NotNull(message = "Last working date is required")
 private LocalDate lastWorkingDate;

 private Integer noticePeriodDays;

 @NotNull(message = "Reason is required")
 private String reason;

 private String detailedReason;
}