
//dto/response/TimesheetResponse.java
package com.hrms.dto.response;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class TimesheetResponse {
 private Long id;
 private Long employeeId;
 private String employeeName;
 private String employeeCode;
 private Long projectId;
 private String projectName;
 private String projectCode;
 private Long taskId;
 private String taskName;
 private LocalDate workDate;
 private BigDecimal hoursWorked;
 private String description;
 private Boolean isBillable;
 private String status;
 private Long approvedBy;
 private LocalDateTime approvedAt;
 private String rejectionReason;
 private LocalDateTime createdAt;
}