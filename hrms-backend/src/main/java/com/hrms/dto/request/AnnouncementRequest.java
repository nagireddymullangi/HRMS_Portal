
//dto/request/AnnouncementRequest.java
package com.hrms.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.time.LocalDateTime;
import java.util.Set;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class AnnouncementRequest {

 @NotBlank(message = "Title is required")
 private String title;

 @NotBlank(message = "Content is required")
 private String content;

 private String priority;
 private String category;
 private String targetAudience;
 private Long departmentId;
 private Set<Long> targetEmployeeIds;
 private String attachmentUrl;
 private Boolean isPinned;
 private LocalDateTime publishDate;
 private LocalDateTime expiryDate;
}