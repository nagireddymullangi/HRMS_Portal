
//model/EventAttendee.java
package com.hrms.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "event_attendees",
    uniqueConstraints = @UniqueConstraint(
        columnNames = {"event_id", "employee_id"}))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class EventAttendee {

 @Id
 @GeneratedValue(strategy = GenerationType.IDENTITY)
 private Long id;

 @ManyToOne(fetch = FetchType.LAZY)
 @JoinColumn(name = "event_id", nullable = false)
 private Event event;

 @ManyToOne(fetch = FetchType.LAZY)
 @JoinColumn(name = "employee_id", nullable = false)
 private Employee employee;

 @Enumerated(EnumType.STRING)
 @Column(name = "rsvp_status")
 private RsvpStatus rsvpStatus = RsvpStatus.PENDING;

 @Column(name = "responded_at")
 private LocalDateTime respondedAt;

 private Boolean attended = false;

 @Column(columnDefinition = "TEXT")
 private String notes;

 @CreationTimestamp
 @Column(name = "created_at", updatable = false)
 private LocalDateTime createdAt;

 public enum RsvpStatus {
     ATTENDING, NOT_ATTENDING, MAYBE, PENDING
 }
}