
//dto/request/DocumentTemplateRequest.java
package com.hrms.dto.request;

import jakarta.validation.constraints.*;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class DocumentTemplateRequest {

 @NotBlank(message = "Name is required")
 private String name;

 @NotBlank(message = "Type is required")
 private String type;

 private String subject;

 @NotBlank(message = "Content is required")
 private String content;

 private String variables;
 private Boolean isActive;
 private Boolean isDefault;
}