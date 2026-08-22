
//service/impl/EventServiceImpl.java
package com.hrms.service.impl;

import com.hrms.dto.request.EventRequest;
import com.hrms.dto.response.EventResponse;
import com.hrms.exception.ResourceNotFoundException;
import com.hrms.model.*;
import com.hrms.repository.*;
import com.hrms.service.EventService;
import com.hrms.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class EventServiceImpl implements EventService {

 private final EventRepository eventRepository;
 private final EventAttendeeRepository attendeeRepository;
 private final DepartmentRepository departmentRepository;
 private final EmployeeRepository employeeRepository;
 private final UserRepository userRepository;
 private final NotificationService notificationService;

 @Override
 @Transactional
 public EventResponse create(EventRequest request, Long userId) {
     Department dept = null;
     if (request.getDepartmentId() != null) {
         dept = departmentRepository.findById(request.getDepartmentId())
                 .orElseThrow(() -> new ResourceNotFoundException(
                     "Department", "id", request.getDepartmentId()));
     }

     Event event = Event.builder()
             .title(request.getTitle())
             .description(request.getDescription())
             .eventType(request.getEventType() != null
                 ? Event.EventType.valueOf(request.getEventType())
                 : Event.EventType.MEETING)
             .startDateTime(request.getStartDateTime())
             .endDateTime(request.getEndDateTime())
             .location(request.getLocation())
             .isVirtual(request.getIsVirtual() != null
                 ? request.getIsVirtual() : false)
             .meetingLink(request.getMeetingLink())
             .isAllDay(request.getIsAllDay() != null
                 ? request.getIsAllDay() : false)
             .targetAudience(request.getTargetAudience() != null
                 ? Event.TargetAudience.valueOf(request.getTargetAudience())
                 : Event.TargetAudience.ALL)
             .department(dept)
             .maxAttendees(request.getMaxAttendees())
             .rsvpRequired(request.getRsvpRequired() != null
                 ? request.getRsvpRequired() : false)
             .rsvpDeadline(request.getRsvpDeadline())
             .color(request.getColor() != null
                 ? request.getColor() : "#3b82f6")
             .bannerUrl(request.getBannerUrl())
             .isActive(true)
             .status(Event.Status.SCHEDULED)
             .createdBy(userId)
             .build();

     Event saved = eventRepository.save(event);

     // Send notifications
     sendEventNotifications(saved);

     return mapToResponse(saved, null);
 }

 private void sendEventNotifications(Event event) {
     try {
         List<Employee> recipients = getEventRecipients(event);
         for (Employee emp : recipients) {
             if (emp.getUser() != null) {
                 notificationService.createNotification(
                     emp.getUser().getId(),
                     "🗓️ New Event: " + event.getTitle(),
                     "Event scheduled for " + event.getStartDateTime(),
                     Notification.NotificationType.EVENT,
                     event.getId(),
                     "EVENT",
                     "/employee/events/" + event.getId(),
                     "calendar",
                     Notification.Priority.MEDIUM
                 );
             }
         }
     } catch (Exception e) {
         log.error("Failed to send event notifications", e);
     }
 }

 private List<Employee> getEventRecipients(Event event) {
     if (event.getTargetAudience() == Event.TargetAudience.ALL) {
         return employeeRepository.findAll();
     }
     if (event.getTargetAudience() == Event.TargetAudience.DEPARTMENT
             && event.getDepartment() != null) {
         return employeeRepository.findByDepartmentId(
             event.getDepartment().getId());
     }
     return new ArrayList<>();
 }

 @Override
 @Transactional
 public EventResponse update(Long id, EventRequest request) {
     Event event = eventRepository.findById(id)
             .orElseThrow(() -> new ResourceNotFoundException(
                 "Event", "id", id));

     event.setTitle(request.getTitle());
     event.setDescription(request.getDescription());
     event.setStartDateTime(request.getStartDateTime());
     event.setEndDateTime(request.getEndDateTime());
     event.setLocation(request.getLocation());
     if (request.getEventType() != null) {
         event.setEventType(Event.EventType.valueOf(request.getEventType()));
     }
     event.setMeetingLink(request.getMeetingLink());
     event.setIsVirtual(request.getIsVirtual());
     event.setColor(request.getColor());
     event.setBannerUrl(request.getBannerUrl());
     event.setMaxAttendees(request.getMaxAttendees());
     event.setRsvpRequired(request.getRsvpRequired());
     event.setRsvpDeadline(request.getRsvpDeadline());

     return mapToResponse(eventRepository.save(event), null);
 }

 @Override
 public EventResponse getById(Long id, Long employeeId) {
     Event event = eventRepository.findById(id)
             .orElseThrow(() -> new ResourceNotFoundException(
                 "Event", "id", id));
     return mapToResponse(event, employeeId);
 }

 @Override
 public List<EventResponse> getAll() {
     return eventRepository.findAllActive()
             .stream()
             .map(e -> mapToResponse(e, null))
             .collect(Collectors.toList());
 }

 @Override
 public List<EventResponse> getUpcoming() {
     return eventRepository.findUpcoming(LocalDateTime.now())
             .stream()
             .map(e -> mapToResponse(e, null))
             .collect(Collectors.toList());
 }

 @Override
 public List<EventResponse> getByDateRange(LocalDateTime start,
                                             LocalDateTime end) {
     return eventRepository.findByDateRange(start, end)
             .stream()
             .map(e -> mapToResponse(e, null))
             .collect(Collectors.toList());
 }

 @Override
 public List<EventResponse> getForEmployee(Long employeeId) {
     Employee emp = employeeRepository.findById(employeeId)
             .orElseThrow(() -> new ResourceNotFoundException(
                 "Employee", "id", employeeId));

     Long deptId = emp.getDepartment() != null
         ? emp.getDepartment().getId() : null;

     return eventRepository.findForEmployee(deptId)
             .stream()
             .map(e -> mapToResponse(e, employeeId))
             .collect(Collectors.toList());
 }

 @Override
 public void delete(Long id) {
     eventRepository.deleteById(id);
 }

 @Override
 @Transactional
 public EventResponse updateStatus(Long id, String status) {
     Event event = eventRepository.findById(id)
             .orElseThrow(() -> new ResourceNotFoundException(
                 "Event", "id", id));
     event.setStatus(Event.Status.valueOf(status));
     return mapToResponse(eventRepository.save(event), null);
 }

 @Override
 @Transactional
 public void updateRsvp(Long eventId, Long employeeId, String status) {
     Event event = eventRepository.findById(eventId)
             .orElseThrow(() -> new ResourceNotFoundException(
                 "Event", "id", eventId));

     Employee emp = employeeRepository.findById(employeeId)
             .orElseThrow(() -> new ResourceNotFoundException(
                 "Employee", "id", employeeId));

     EventAttendee attendee = attendeeRepository
             .findByEventIdAndEmployeeId(eventId, employeeId)
             .orElse(EventAttendee.builder()
                 .event(event)
                 .employee(emp)
                 .build());

     attendee.setRsvpStatus(EventAttendee.RsvpStatus.valueOf(status));
     attendee.setRespondedAt(LocalDateTime.now());
     attendeeRepository.save(attendee);
 }

 private EventResponse mapToResponse(Event e, Long employeeId) {
     String createdByName = "Unknown";
     try {
         User user = userRepository.findById(e.getCreatedBy()).orElse(null);
         if (user != null) {
             Employee emp = employeeRepository
                 .findByUser_Id(user.getId()).orElse(null);
             createdByName = emp != null ? emp.getFullName() : user.getUsername();
         }
     } catch (Exception ex) {
         log.warn("Could not fetch creator name", ex);
     }

     Long attendingCount = attendeeRepository.countAttendingByEventId(e.getId());

     String myRsvp = null;
     if (employeeId != null) {
         myRsvp = attendeeRepository
             .findByEventIdAndEmployeeId(e.getId(), employeeId)
             .map(a -> a.getRsvpStatus().name())
             .orElse("PENDING");
     }

     return EventResponse.builder()
             .id(e.getId())
             .title(e.getTitle())
             .description(e.getDescription())
             .eventType(e.getEventType().name())
             .startDateTime(e.getStartDateTime())
             .endDateTime(e.getEndDateTime())
             .location(e.getLocation())
             .isVirtual(e.getIsVirtual())
             .meetingLink(e.getMeetingLink())
             .isAllDay(e.getIsAllDay())
             .targetAudience(e.getTargetAudience().name())
             .departmentId(e.getDepartment() != null
                 ? e.getDepartment().getId() : null)
             .departmentName(e.getDepartment() != null
                 ? e.getDepartment().getName() : null)
             .maxAttendees(e.getMaxAttendees())
             .rsvpRequired(e.getRsvpRequired())
             .rsvpDeadline(e.getRsvpDeadline())
             .color(e.getColor())
             .bannerUrl(e.getBannerUrl())
             .isActive(e.getIsActive())
             .status(e.getStatus().name())
             .createdBy(e.getCreatedBy())
             .createdByName(createdByName)
             .attendingCount(attendingCount)
             .myRsvpStatus(myRsvp)
             .createdAt(e.getCreatedAt())
             .build();
 }
}