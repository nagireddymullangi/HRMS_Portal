
//dto/response/FaceVerificationResponse.java
package com.hrms.dto.response;

import lombok.*;

import java.math.BigDecimal;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class FaceVerificationResponse {
 private boolean success;
 private Long employeeId;
 private String employeeName;
 private String employeeCode;
 private BigDecimal confidenceScore;
 private String message;
 private String storedDescriptor;
}