
//controller/EventController.java
package com.hrms.controller;

import com.hrms.dto.request.EventRequest;
import com.hrms.dto.response.ApiResponse;
import com.hrms.dto.response.EventResponse;
import com.hrms.model.User;
import com.hrms.repository.UserRepository;
import com.hrms.service.EventService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/events")
@RequiredArgsConstructor
public class EventController {

 private final EventService service;
 private final UserRepository userRepository;

 @PostMapping
 @PreAuthorize("hasRole('ADMIN')")
 public ResponseEntity<ApiResponse<EventResponse>> create(
         @Valid @RequestBody EventRequest request, Authentication auth) {
     User user = userRepository.findByUsername(auth.getName()).orElseThrow();
     return ResponseEntity.ok(ApiResponse.success("Event created",
         service.create(request, user.getId())));
 }

 @GetMapping
 @PreAuthorize("hasAnyRole('ADMIN','EMPLOYEE')")
 public ResponseEntity<ApiResponse<List<EventResponse>>> getAll() {
     return ResponseEntity.ok(ApiResponse.success("Success",
         service.getAll()));
 }

 @GetMapping("/upcoming")
 @PreAuthorize("hasAnyRole('ADMIN','EMPLOYEE')")
 public ResponseEntity<ApiResponse<List<EventResponse>>> getUpcoming() {
     return ResponseEntity.ok(ApiResponse.success("Success",
         service.getUpcoming()));
 }

 @GetMapping("/date-range")
 @PreAuthorize("hasAnyRole('ADMIN','EMPLOYEE')")
 public ResponseEntity<ApiResponse<List<EventResponse>>> getByDateRange(
         @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
         LocalDateTime start,
         @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
         LocalDateTime end) {
     return ResponseEntity.ok(ApiResponse.success("Success",
         service.getByDateRange(start, end)));
 }

 @GetMapping("/employee/{employeeId}")
 @PreAuthorize("hasAnyRole('ADMIN','EMPLOYEE')")
 public ResponseEntity<ApiResponse<List<EventResponse>>> getForEmployee(
         @PathVariable Long employeeId) {
     return ResponseEntity.ok(ApiResponse.success("Success",
         service.getForEmployee(employeeId)));
 }

 @GetMapping("/{id}")
 @PreAuthorize("hasAnyRole('ADMIN','EMPLOYEE')")
 public ResponseEntity<ApiResponse<EventResponse>> getById(
         @PathVariable Long id,
         @RequestParam(required = false) Long employeeId) {
     return ResponseEntity.ok(ApiResponse.success("Success",
         service.getById(id, employeeId)));
 }

 @PutMapping("/{id}")
 @PreAuthorize("hasRole('ADMIN')")
 public ResponseEntity<ApiResponse<EventResponse>> update(
         @PathVariable Long id,
         @Valid @RequestBody EventRequest request) {
     return ResponseEntity.ok(ApiResponse.success("Updated",
         service.update(id, request)));
 }

 @DeleteMapping("/{id}")
 @PreAuthorize("hasRole('ADMIN')")
 public ResponseEntity<ApiResponse<String>> delete(@PathVariable Long id) {
     service.delete(id);
     return ResponseEntity.ok(ApiResponse.success("Deleted"));
 }

 @PatchMapping("/{id}/status")
 @PreAuthorize("hasRole('ADMIN')")
 public ResponseEntity<ApiResponse<EventResponse>> updateStatus(
         @PathVariable Long id, @RequestParam String status) {
     return ResponseEntity.ok(ApiResponse.success("Status updated",
         service.updateStatus(id, status)));
 }

 @PostMapping("/{eventId}/rsvp")
 @PreAuthorize("hasAnyRole('ADMIN','EMPLOYEE')")
 public ResponseEntity<ApiResponse<String>> updateRsvp(
         @PathVariable Long eventId,
         @RequestBody Map<String, Object> body) {
     Long employeeId = Long.valueOf(body.get("employeeId").toString());
     String status = (String) body.get("status");
     service.updateRsvp(eventId, employeeId, status);
     return ResponseEntity.ok(ApiResponse.success("RSVP updated"));
 }
}