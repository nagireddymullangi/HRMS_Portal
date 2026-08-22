
//controller/AnnouncementController.java
package com.hrms.controller;

import com.hrms.dto.request.AnnouncementRequest;
import com.hrms.dto.response.ApiResponse;
import com.hrms.dto.response.AnnouncementResponse;
import com.hrms.model.User;
import com.hrms.repository.UserRepository;
import com.hrms.service.AnnouncementService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/announcements")
@RequiredArgsConstructor
public class AnnouncementController {

 private final AnnouncementService service;
 private final UserRepository userRepository;

 @PostMapping
 @PreAuthorize("hasRole('ADMIN')")
 public ResponseEntity<ApiResponse<AnnouncementResponse>> create(
         @Valid @RequestBody AnnouncementRequest request,
         Authentication auth) {
     User user = userRepository.findByUsername(auth.getName())
             .orElseThrow();
     return ResponseEntity.ok(ApiResponse.success("Created",
         service.create(request, user.getId())));
 }

 @PutMapping("/{id}")
 @PreAuthorize("hasRole('ADMIN')")
 public ResponseEntity<ApiResponse<AnnouncementResponse>> update(
         @PathVariable Long id,
         @Valid @RequestBody AnnouncementRequest request) {
     return ResponseEntity.ok(ApiResponse.success("Updated",
         service.update(id, request)));
 }

 @GetMapping("/{id}")
 @PreAuthorize("hasAnyRole('ADMIN','EMPLOYEE')")
 public ResponseEntity<ApiResponse<AnnouncementResponse>> getById(
         @PathVariable Long id,
         @RequestParam(required = false) Long employeeId) {
     return ResponseEntity.ok(ApiResponse.success("Success",
         service.getById(id, employeeId)));
 }

 @GetMapping
 @PreAuthorize("hasRole('ADMIN')")
 public ResponseEntity<ApiResponse<List<AnnouncementResponse>>> getAll() {
     return ResponseEntity.ok(ApiResponse.success("Success",
         service.getAll()));
 }

 @GetMapping("/employee/{employeeId}")
 @PreAuthorize("hasAnyRole('ADMIN','EMPLOYEE')")
 public ResponseEntity<ApiResponse<List<AnnouncementResponse>>>
         getForEmployee(@PathVariable Long employeeId) {
     return ResponseEntity.ok(ApiResponse.success("Success",
         service.getForEmployee(employeeId)));
 }

 @DeleteMapping("/{id}")
 @PreAuthorize("hasRole('ADMIN')")
 public ResponseEntity<ApiResponse<String>> delete(@PathVariable Long id) {
     service.delete(id);
     return ResponseEntity.ok(ApiResponse.success("Deleted"));
 }

 @PostMapping("/{id}/read/{employeeId}")
 @PreAuthorize("hasAnyRole('ADMIN','EMPLOYEE')")
 public ResponseEntity<ApiResponse<String>> markAsRead(
         @PathVariable Long id, @PathVariable Long employeeId) {
     service.markAsRead(id, employeeId);
     return ResponseEntity.ok(ApiResponse.success("Marked as read"));
 }

 @PatchMapping("/{id}/toggle-pin")
 @PreAuthorize("hasRole('ADMIN')")
 public ResponseEntity<ApiResponse<String>> togglePin(@PathVariable Long id) {
     service.togglePin(id);
     return ResponseEntity.ok(ApiResponse.success("Pin toggled"));
 }

 @PatchMapping("/{id}/toggle-active")
 @PreAuthorize("hasRole('ADMIN')")
 public ResponseEntity<ApiResponse<String>> toggleActive(
         @PathVariable Long id) {
     service.toggleActive(id);
     return ResponseEntity.ok(ApiResponse.success("Status toggled"));
 }
}