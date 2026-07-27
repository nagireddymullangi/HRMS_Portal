
//dto/response/DocumentTemplateResponse.java
package com.hrms.dto.response;

import lombok.*;

import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class DocumentTemplateResponse {
 private Long id;
 private String name;
 private String type;
 private String subject;
 private String content;
 private String variables;
 private Boolean isActive;
 private Boolean isDefault;
 private LocalDateTime createdAt;
 private LocalDateTime updatedAt;
}