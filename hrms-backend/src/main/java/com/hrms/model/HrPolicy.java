
//model/HrPolicy.java
package com.hrms.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "hr_policies")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class HrPolicy {

 @Id
 @GeneratedValue(strategy = GenerationType.IDENTITY)
 private Long id;

 @Column(name = "policy_code", unique = true, nullable = false, length = 50)
 private String policyCode;

 @Column(nullable = false, length = 255)
 private String title;

 @Column(columnDefinition = "TEXT")
 private String description;

 @Column(nullable = false, columnDefinition = "LONGTEXT")
 private String content;

 @Enumerated(EnumType.STRING)
 private Category category = Category.OTHER;

 @Column(length = 20)
 private String version = "1.0";

 @Column(name = "effective_date", nullable = false)
 private LocalDate effectiveDate;

 @Column(name = "expiry_date")
 private LocalDate expiryDate;

 @ManyToOne(fetch = FetchType.LAZY)
 @JoinColumn(name = "department_id")
 private Department department;

 @Column(name = "is_mandatory")
 private Boolean isMandatory = true;

 @Column(name = "requires_acknowledgment")
 private Boolean requiresAcknowledgment = true;

 @Enumerated(EnumType.STRING)
 private Status status = Status.DRAFT;

 @Column(name = "document_url", length = 500)
 private String documentUrl;

 @Column(name = "created_by")
 private Long createdBy;

 @Column(name = "approved_by")
 private Long approvedBy;

 @Column(name = "approved_at")
 private LocalDateTime approvedAt;

 @CreationTimestamp
 @Column(name = "created_at", updatable = false)
 private LocalDateTime createdAt;

 @UpdateTimestamp
 @Column(name = "updated_at")
 private LocalDateTime updatedAt;

 public enum Category {
     LEAVE, ATTENDANCE, CODE_OF_CONDUCT, TRAVEL, REMOTE_WORK,
     SECURITY, BENEFITS, COMPENSATION, PERFORMANCE, DIVERSITY,
     GRIEVANCE, SAFETY, CONFIDENTIALITY, OTHER
 }

 public enum Status { DRAFT, ACTIVE, ARCHIVED, EXPIRED }
}