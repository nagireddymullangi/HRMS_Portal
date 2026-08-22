
//dto/request/EventRequest.java
package com.hrms.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class EventRequest {

 @NotBlank(message = "Title is required")
 private String title;

 private String description;
 private String eventType;

 @NotNull(message = "Start date is required")
 private LocalDateTime startDateTime;

 @NotNull(message = "End date is required")
 private LocalDateTime endDateTime;

 private String location;
 private Boolean isVirtual;
 private String meetingLink;
 private Boolean isAllDay;
 private String targetAudience;
 private Long departmentId;
 private Integer maxAttendees;
 private Boolean rsvpRequired;
 private LocalDateTime rsvpDeadline;
 private String color;
 private String bannerUrl;
}