
//dto/response/DepartmentResponse.java
package com.hrms.dto.response;

import lombok.*;
import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class DepartmentResponse {
 private Long id;
 private String name;
 private String description;
 private Long employeeCount;
 private LocalDateTime createdAt;
}