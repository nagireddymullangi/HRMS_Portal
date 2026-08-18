
//dto/request/FaceEnrollmentRequest.java
package com.hrms.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.*;
import java.math.BigDecimal;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class FaceEnrollmentRequest {

 @NotNull
 private Long employeeId;

 @NotNull
 private String faceDescriptor;

 private String photoBase64;
 private BigDecimal qualityScore;
}