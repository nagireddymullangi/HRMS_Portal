
//dto/request/LeaveRequest.java
package com.hrms.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import java.time.LocalDate;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class LeaveRequest {

 @NotNull(message = "Leave type is required")
 private Long leaveTypeId;

 @NotNull(message = "Start date is required")
 private LocalDate startDate;

 @NotNull(message = "End date is required")
 private LocalDate endDate;

 @NotBlank(message = "Reason is required")
 private String reason;
}