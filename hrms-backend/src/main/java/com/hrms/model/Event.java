
//model/Event.java
package com.hrms.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "events")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Event {

 @Id
 @GeneratedValue(strategy = GenerationType.IDENTITY)
 private Long id;

 @Column(nullable = false, length = 255)
 private String title;

 @Column(columnDefinition = "TEXT")
 private String description;

 @Enumerated(EnumType.STRING)
 @Column(name = "event_type")
 private EventType eventType = EventType.MEETING;

 @Column(name = "start_date_time", nullable = false)
 private LocalDateTime startDateTime;

 @Column(name = "end_date_time", nullable = false)
 private LocalDateTime endDateTime;

 @Column(length = 500)
 private String location;

 @Column(name = "is_virtual")
 private Boolean isVirtual = false;

 @Column(name = "meeting_link", length = 500)
 private String meetingLink;

 @Column(name = "is_all_day")
 private Boolean isAllDay = false;

 @Enumerated(EnumType.STRING)
 @Column(name = "target_audience")
 private TargetAudience targetAudience = TargetAudience.ALL;

 @ManyToOne(fetch = FetchType.LAZY)
 @JoinColumn(name = "department_id")
 private Department department;

 @Column(name = "max_attendees")
 private Integer maxAttendees;

 @Column(name = "rsvp_required")
 private Boolean rsvpRequired = false;

 @Column(name = "rsvp_deadline")
 private LocalDateTime rsvpDeadline;

 @Column(length = 20)
 private String color = "#3b82f6";

 @Column(name = "banner_url", length = 500)
 private String bannerUrl;

 @Column(name = "is_active")
 private Boolean isActive = true;

 @Enumerated(EnumType.STRING)
 private Status status = Status.SCHEDULED;

 @Column(name = "created_by", nullable = false)
 private Long createdBy;

 @OneToMany(mappedBy = "event", cascade = CascadeType.ALL,
            orphanRemoval = true, fetch = FetchType.LAZY)
 @Builder.Default
 private List<EventAttendee> attendees = new ArrayList<>();

 @CreationTimestamp
 @Column(name = "created_at", updatable = false)
 private LocalDateTime createdAt;

 @UpdateTimestamp
 @Column(name = "updated_at")
 private LocalDateTime updatedAt;

 public enum EventType {
     MEETING, TRAINING, WORKSHOP, SEMINAR, CELEBRATION,
     HOLIDAY, TEAM_BUILDING, CONFERENCE, WEBINAR, OTHER
 }

 public enum TargetAudience { ALL, DEPARTMENT, SPECIFIC }
 public enum Status { SCHEDULED, ONGOING, COMPLETED, CANCELLED }
}