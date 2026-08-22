
//model/Notification.java
package com.hrms.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Notification {

 @Id
 @GeneratedValue(strategy = GenerationType.IDENTITY)
 private Long id;

 @Column(name = "user_id", nullable = false)
 private Long userId;

 @Column(nullable = false, length = 255)
 private String title;

 @Column(nullable = false, columnDefinition = "TEXT")
 private String message;

 @Enumerated(EnumType.STRING)
 private NotificationType type = NotificationType.GENERAL;

 @Column(name = "reference_id")
 private Long referenceId;

 @Column(name = "reference_type", length = 50)
 private String referenceType;

 @Column(name = "action_url", length = 500)
 private String actionUrl;

 @Column(length = 50)
 private String icon;

 @Column(name = "is_read")
 private Boolean isRead = false;

 @Column(name = "read_at")
 private LocalDateTime readAt;

 @Enumerated(EnumType.STRING)
 private Priority priority = Priority.MEDIUM;

 @CreationTimestamp
 @Column(name = "created_at", updatable = false)
 private LocalDateTime createdAt;

 public enum NotificationType {
     ANNOUNCEMENT, EVENT, LEAVE, ATTENDANCE,
     PAYROLL, SYSTEM, GENERAL
 }

 public enum Priority { LOW, MEDIUM, HIGH, URGENT }
}