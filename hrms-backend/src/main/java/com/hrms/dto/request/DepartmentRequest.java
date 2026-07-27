
//dto/request/DepartmentRequest.java
package com.hrms.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class DepartmentRequest {

 @NotBlank(message = "Department name is required")
 private String name;

 private String description;
}