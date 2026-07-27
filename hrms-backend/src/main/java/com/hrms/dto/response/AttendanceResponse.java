
//dto/response/AttendanceResponse.java
package com.hrms.dto.response;

import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class AttendanceResponse {
 private Long id;
 private Long employeeId;
 private String employeeName;
 private String employeeCode;
 private String departmentName;
 private LocalDate date;
 private LocalTime checkIn;
 private LocalTime checkOut;
 private String status;
 private Double workingHours;
 private String notes;
 private LocalDateTime createdAt;
}