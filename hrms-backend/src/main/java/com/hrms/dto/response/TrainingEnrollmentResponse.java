
//dto/response/TrainingEnrollmentResponse.java
package com.hrms.dto.response;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class TrainingEnrollmentResponse {
 private Long id;
 private Long programId;
 private String programCode;
 private String programTitle;
 private String programCategory;
 private String trainingType;
 private BigDecimal durationHours;
 private Long employeeId;
 private String employeeName;
 private String employeeCode;
 private LocalDateTime enrolledDate;
 private String status;
 private LocalDate completionDate;
 private BigDecimal score;
 private String grade;
 private String certificateUrl;
 private String feedback;
 private Integer rating;
}