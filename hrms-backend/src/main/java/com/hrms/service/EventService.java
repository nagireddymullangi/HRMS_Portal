
//service/EventService.java
package com.hrms.service;

import com.hrms.dto.request.EventRequest;
import com.hrms.dto.response.EventResponse;

import java.time.LocalDateTime;
import java.util.List;

public interface EventService {
 EventResponse create(EventRequest request, Long userId);
 EventResponse update(Long id, EventRequest request);
 EventResponse getById(Long id, Long employeeId);
 List<EventResponse> getAll();
 List<EventResponse> getUpcoming();
 List<EventResponse> getByDateRange(LocalDateTime start, LocalDateTime end);
 List<EventResponse> getForEmployee(Long employeeId);
 void delete(Long id);
 EventResponse updateStatus(Long id, String status);
 void updateRsvp(Long eventId, Long employeeId, String status);
}