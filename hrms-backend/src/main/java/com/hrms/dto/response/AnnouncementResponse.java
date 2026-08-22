
//dto/response/AnnouncementResponse.java
package com.hrms.dto.response;

import lombok.*;

import java.time.LocalDateTime;
import java.util.Set;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class AnnouncementResponse {
 private Long id;
 private String title;
 private String content;
 private String priority;
 private String category;
 private String targetAudience;
 private Long departmentId;
 private String departmentName;
 private String attachmentUrl;
 private Boolean isActive;
 private Boolean isPinned;
 private LocalDateTime publishDate;
 private LocalDateTime expiryDate;
 private Long createdBy;
 private String createdByName;
 private Integer viewCount;
 private Long readCount;
 private Boolean isRead;
 private Set<Long> targetEmployeeIds;
 private LocalDateTime createdAt;
 private LocalDateTime updatedAt;
}