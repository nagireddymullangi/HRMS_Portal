
//model/PasswordResetToken.java
package com.hrms.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "password_reset_tokens")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PasswordResetToken {

 @Id
 @GeneratedValue(strategy = GenerationType.IDENTITY)
 private Long id;

 @Column(nullable = false, unique = true, length = 255)
 private String token;

 @ManyToOne(fetch = FetchType.LAZY)
 @JoinColumn(name = "user_id", nullable = false)
 private User user;

 @Column(nullable = false, length = 150)
 private String email;

 @Column(name = "expiry_date", nullable = false)
 private LocalDateTime expiryDate;

 @Column(name = "is_used")
 private Boolean isUsed = false;

 @Column(name = "used_at")
 private LocalDateTime usedAt;

 @Column(name = "ip_address", length = 50)
 private String ipAddress;

 @Column(name = "user_agent", length = 500)
 private String userAgent;

 @CreationTimestamp
 @Column(name = "created_at", updatable = false)
 private LocalDateTime createdAt;

 // Helper method to check if token is expired
 public boolean isExpired() {
     return LocalDateTime.now().isAfter(expiryDate);
 }

 // Helper method to check if token is valid
 public boolean isValid() {
     return !isUsed && !isExpired();
 }
}