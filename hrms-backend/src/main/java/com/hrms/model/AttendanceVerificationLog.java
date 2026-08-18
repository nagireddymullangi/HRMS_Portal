
//model/AttendanceVerificationLog.java
package com.hrms.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "attendance_verification_logs")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class AttendanceVerificationLog {

 @Id
 @GeneratedValue(strategy = GenerationType.IDENTITY)
 private Long id;

 @ManyToOne(fetch = FetchType.LAZY)
 @JoinColumn(name = "employee_id", nullable = false)
 private Employee employee;

 @Enumerated(EnumType.STRING)
 @Column(name = "verification_type", nullable = false)
 private VerificationType verificationType;

 @Enumerated(EnumType.STRING)
 @Column(name = "verification_status", nullable = false)
 private VerificationStatus verificationStatus;

 @Column(name = "confidence_score", precision = 4, scale = 2)
 private BigDecimal confidenceScore;

 @ManyToOne(fetch = FetchType.LAZY)
 @JoinColumn(name = "device_id")
 private BiometricDevice device;

 @Column(name = "ip_address", length = 50)
 private String ipAddress;

 @Column(name = "user_agent", length = 500)
 private String userAgent;

 @Column(name = "error_message", columnDefinition = "TEXT")
 private String errorMessage;

 @CreationTimestamp
 @Column(name = "attempted_at", updatable = false)
 private LocalDateTime attemptedAt;

 public enum VerificationType {
     FACE, FINGERPRINT, MANUAL
 }

 public enum VerificationStatus {
     SUCCESS, FAILED, LOW_CONFIDENCE
 }
}