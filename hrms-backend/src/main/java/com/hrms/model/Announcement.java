
//model/Announcement.java
package com.hrms.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "announcements")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Announcement {

 @Id
 @GeneratedValue(strategy = GenerationType.IDENTITY)
 private Long id;

 @Column(nullable = false, length = 255)
 private String title;

 @Column(nullable = false, columnDefinition = "LONGTEXT")
 private String content;

 @Enumerated(EnumType.STRING)
 private Priority priority = Priority.MEDIUM;

 @Column(length = 50)
 private String category = "GENERAL";

 @Enumerated(EnumType.STRING)
 @Column(name = "target_audience")
 private TargetAudience targetAudience = TargetAudience.ALL;

 @ManyToOne(fetch = FetchType.LAZY)
 @JoinColumn(name = "department_id")
 private Department department;

 @Column(name = "attachment_url", length = 500)
 private String attachmentUrl;

 @Column(name = "is_active")
 private Boolean isActive = true;

 @Column(name = "is_pinned")
 private Boolean isPinned = false;

 @Column(name = "publish_date")
 private LocalDateTime publishDate;

 @Column(name = "expiry_date")
 private LocalDateTime expiryDate;

 @Column(name = "created_by", nullable = false)
 private Long createdBy;

 @Column(name = "view_count")
 private Integer viewCount = 0;

 @ManyToMany
 @JoinTable(
     name = "announcement_targets",
     joinColumns = @JoinColumn(name = "announcement_id"),
     inverseJoinColumns = @JoinColumn(name = "employee_id")
 )
 @Builder.Default
 private Set<Employee> targetEmployees = new HashSet<>();

 @CreationTimestamp
 @Column(name = "created_at", updatable = false)
 private LocalDateTime createdAt;

 @UpdateTimestamp
 @Column(name = "updated_at")
 private LocalDateTime updatedAt;

 public enum Priority { LOW, MEDIUM, HIGH, URGENT }
 public enum TargetAudience { ALL, DEPARTMENT, SPECIFIC }

 // Helper: Check if expired
 public boolean isExpired() {
     return expiryDate != null && LocalDateTime.now().isAfter(expiryDate);
 }
}