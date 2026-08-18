
//dto/request/FaceAttendanceRequest.java
package com.hrms.dto.request;

import lombok.*;

import java.math.BigDecimal;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class FaceAttendanceRequest {
 private Long employeeId;
 private String faceDescriptor;
 private String photoBase64;
 private BigDecimal confidenceScore;
 private BigDecimal latitude;
 private BigDecimal longitude;
 private String location;
 private String type; // CHECK_IN or CHECK_OUT
}