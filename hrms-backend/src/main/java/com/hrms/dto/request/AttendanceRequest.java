
//dto/request/AttendanceRequest.java
package com.hrms.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class AttendanceRequest {

 @NotNull(message = "Employee ID is required")
 private Long employeeId;

 @NotNull(message = "Date is required")
 private LocalDate date;

 private LocalTime checkIn;
 private LocalTime checkOut;
 private String status;
 private String notes;
}