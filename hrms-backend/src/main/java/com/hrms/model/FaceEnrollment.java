
//model/FaceEnrollment.java
package com.hrms.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "face_enrollments")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class FaceEnrollment {

 @Id
 @GeneratedValue(strategy = GenerationType.IDENTITY)
 private Long id;

 @OneToOne(fetch = FetchType.LAZY)
 @JoinColumn(name = "employee_id", nullable = false, unique = true)
 private Employee employee;

 @Column(name = "face_descriptor", nullable = false,
         columnDefinition = "LONGTEXT")
 private String faceDescriptor;

 @Column(name = "face_image_url", length = 500)
 private String faceImageUrl;

 @Column(name = "quality_score", precision = 4, scale = 2)
 private BigDecimal qualityScore;

 @Column(name = "is_active")
 private Boolean isActive = true;

 @CreationTimestamp
 @Column(name = "enrolled_at", updatable = false)
 private LocalDateTime enrolledAt;

 @UpdateTimestamp
 @Column(name = "updated_at")
 private LocalDateTime updatedAt;
}