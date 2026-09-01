
//model/GrievanceComment.java
package com.hrms.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "grievance_comments")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class GrievanceComment {

 @Id
 @GeneratedValue(strategy = GenerationType.IDENTITY)
 private Long id;

 @ManyToOne(fetch = FetchType.LAZY)
 @JoinColumn(name = "grievance_id", nullable = false)
 private Grievance grievance;

 @Column(name = "user_id", nullable = false)
 private Long userId;

 @Column(nullable = false, columnDefinition = "TEXT")
 private String comment;

 @Column(name = "is_internal")
 private Boolean isInternal = false;

 @CreationTimestamp
 @Column(name = "created_at", updatable = false)
 private LocalDateTime createdAt;
}