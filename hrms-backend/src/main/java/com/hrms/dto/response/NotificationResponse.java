
//dto/response/NotificationResponse.java
package com.hrms.dto.response;

import lombok.*;

import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class NotificationResponse {
 private Long id;
 private String title;
 private String message;
 private String type;
 private Long referenceId;
 private String referenceType;
 private String actionUrl;
 private String icon;
 private Boolean isRead;
 private LocalDateTime readAt;
 private String priority;
 private LocalDateTime createdAt;
 private String timeAgo;
}