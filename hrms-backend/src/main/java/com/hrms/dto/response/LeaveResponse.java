
//dto/response/LeaveResponse.java
package com.hrms.dto.response;

import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class LeaveResponse {
 private Long id;
 private Long employeeId;
 private String employeeName;
 private String employeeCode;
 private String departmentName;
 private Long leaveTypeId;
 private String leaveTypeName;
 private LocalDate startDate;
 private LocalDate endDate;
 private Integer totalDays;
 private String reason;
 private String status;
 private String adminComment;
 private LocalDateTime appliedAt;
 private LocalDateTime updatedAt;
}