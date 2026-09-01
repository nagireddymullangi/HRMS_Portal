
//model/Interview.java
package com.hrms.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "interviews")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Interview {

 @Id
 @GeneratedValue(strategy = GenerationType.IDENTITY)
 private Long id;

 @ManyToOne(fetch = FetchType.LAZY)
 @JoinColumn(name = "application_id", nullable = false)
 private JobApplication application;

 @Column(name = "round_number")
 private Integer roundNumber = 1;

 @Enumerated(EnumType.STRING)
 @Column(name = "round_type")
 private RoundType roundType = RoundType.TECHNICAL;

 @Column(name = "scheduled_date", nullable = false)
 private LocalDateTime scheduledDate;

 @Column(name = "duration_minutes")
 private Integer durationMinutes = 60;

 @Enumerated(EnumType.STRING)
 private Mode mode = Mode.VIDEO;

 @Column(length = 500)
 private String location;

 @Column(name = "meeting_link", length = 500)
 private String meetingLink;

 @Column(name = "interviewer_ids", columnDefinition = "TEXT")
 private String interviewerIds;

 @Enumerated(EnumType.STRING)
 private Status status = Status.SCHEDULED;

 @Column(columnDefinition = "TEXT")
 private String feedback;

 @Column(precision = 3, scale = 1)
 private BigDecimal rating;

 @Enumerated(EnumType.STRING)
 private Recommendation recommendation;

 @Column(name = "completed_at")
 private LocalDateTime completedAt;

 @CreationTimestamp
 @Column(name = "created_at", updatable = false)
 private LocalDateTime createdAt;

 public enum RoundType {
     SCREENING, TECHNICAL, HR, MANAGERIAL, FINAL, OTHER
 }

 public enum Mode { IN_PERSON, VIDEO, PHONE }

 public enum Status {
     SCHEDULED, COMPLETED, CANCELLED, RESCHEDULED, NO_SHOW
 }

 public enum Recommendation {
     STRONG_HIRE, HIRE, MAYBE, NO_HIRE
 }
}