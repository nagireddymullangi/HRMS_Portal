
//model/DocumentTemplate.java
package com.hrms.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "document_templates")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class DocumentTemplate {

 @Id
 @GeneratedValue(strategy = GenerationType.IDENTITY)
 private Long id;

 @Column(nullable = false, length = 150)
 private String name;

 @Enumerated(EnumType.STRING)
 @Column(nullable = false)
 private DocumentType type;

 @Column(length = 255)
 private String subject;

 @Column(nullable = false, columnDefinition = "LONGTEXT")
 private String content;

 @Column(columnDefinition = "TEXT")
 private String variables;

 @Column(name = "is_active")
 private Boolean isActive = true;

 @Column(name = "is_default")
 private Boolean isDefault = false;

 @Column(name = "created_by")
 private Long createdBy;

 @CreationTimestamp
 @Column(name = "created_at", updatable = false)
 private LocalDateTime createdAt;

 @UpdateTimestamp
 @Column(name = "updated_at")
 private LocalDateTime updatedAt;

 public enum DocumentType {
     OFFER_LETTER,
     APPOINTMENT_LETTER,
     EXPERIENCE_LETTER,
     RELIEVING_LETTER,
     SALARY_CERTIFICATE,
     WARNING_LETTER,
     PROMOTION_LETTER,
     TRANSFER_LETTER,
     TERMINATION_LETTER,
     NOC,
     OTHER
 }
}