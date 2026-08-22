
//dto/response/EventResponse.java
package com.hrms.dto.response;

import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class EventResponse {
 private Long id;
 private String title;
 private String description;
 private String eventType;
 private LocalDateTime startDateTime;
 private LocalDateTime endDateTime;
 private String location;
 private Boolean isVirtual;
 private String meetingLink;
 private Boolean isAllDay;
 private String targetAudience;
 private Long departmentId;
 private String departmentName;
 private Integer maxAttendees;
 private Boolean rsvpRequired;
 private LocalDateTime rsvpDeadline;
 private String color;
 private String bannerUrl;
 private Boolean isActive;
 private String status;
 private Long createdBy;
 private String createdByName;
 private Long attendingCount;
 private String myRsvpStatus;
 private List<EventAttendeeResponse> attendees;
 private LocalDateTime createdAt;
}

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
class EventAttendeeResponse {
 private Long employeeId;
 private String employeeName;
 private String employeeCode;
 private String rsvpStatus;
 private LocalDateTime respondedAt;
}