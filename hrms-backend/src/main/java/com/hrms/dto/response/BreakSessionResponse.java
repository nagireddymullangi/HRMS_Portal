
//dto/response/BreakSessionResponse.java
package com.hrms.dto.response;

import lombok.*;

import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class BreakSessionResponse {
 private Long id;
 private Long employeeId;
 private String employeeName;
 private String breakType;
 private LocalDateTime startTime;
 private LocalDateTime endTime;
 private Integer durationMinutes;
 private Long currentDurationMinutes;
 private Integer maxAllowedMinutes;
 private Boolean isExceeded;
 private String reason;
 private String location;
 private String status;
 private LocalDateTime createdAt;
}