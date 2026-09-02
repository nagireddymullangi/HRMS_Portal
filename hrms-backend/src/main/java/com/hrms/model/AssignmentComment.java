
//model/AssignmentComment.java
package com.hrms.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "assignment_comments")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class AssignmentComment {

 @Id
 @GeneratedValue(strategy = GenerationType.IDENTITY)
 private Long id;

 @ManyToOne(fetch = FetchType.LAZY)
 @JoinColumn(name = "assignment_id", nullable = false)
 private DailyWorkAssignment assignment;

 @Column(name = "user_id", nullable = false)
 private Long userId;

 @Column(nullable = false, columnDefinition = "TEXT")
 private String comment;

 @Enumerated(EnumType.STRING)
 @Column(name = "comment_type")
 private CommentType commentType = CommentType.GENERAL;

 @Column(name = "attachment_url", length = 500)
 private String attachmentUrl;

 @CreationTimestamp
 @Column(name = "created_at", updatable = false)
 private LocalDateTime createdAt;

 public enum CommentType {
     UPDATE, QUESTION, BLOCKER, RESOLUTION, GENERAL
 }
}