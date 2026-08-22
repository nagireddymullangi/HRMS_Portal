
//controller/NotificationController.java
package com.hrms.controller;

import com.hrms.dto.response.ApiResponse;
import com.hrms.dto.response.NotificationResponse;
import com.hrms.model.User;
import com.hrms.repository.UserRepository;
import com.hrms.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN','EMPLOYEE')")
public class NotificationController {

 private final NotificationService service;
 private final UserRepository userRepository;

 @GetMapping("/recent")
 public ResponseEntity<ApiResponse<List<NotificationResponse>>> getRecent(
         Authentication auth) {
     User user = userRepository.findByUsername(auth.getName()).orElseThrow();
     return ResponseEntity.ok(ApiResponse.success("Success",
         service.getRecent(user.getId())));
 }

 @GetMapping
 public ResponseEntity<ApiResponse<List<NotificationResponse>>> getAll(
         Authentication auth,
         @RequestParam(defaultValue = "0") int page,
         @RequestParam(defaultValue = "20") int size) {
     User user = userRepository.findByUsername(auth.getName()).orElseThrow();
     return ResponseEntity.ok(ApiResponse.success("Success",
         service.getAll(user.getId(), page, size)));
 }

 @GetMapping("/unread-count")
 public ResponseEntity<ApiResponse<Map<String, Long>>> getUnreadCount(
         Authentication auth) {
     User user = userRepository.findByUsername(auth.getName()).orElseThrow();
     return ResponseEntity.ok(ApiResponse.success("Success",
         Map.of("count", service.getUnreadCount(user.getId()))));
 }

 @PatchMapping("/{id}/read")
 public ResponseEntity<ApiResponse<String>> markAsRead(@PathVariable Long id) {
     service.markAsRead(id);
     return ResponseEntity.ok(ApiResponse.success("Marked as read"));
 }

 @PatchMapping("/read-all")
 public ResponseEntity<ApiResponse<String>> markAllAsRead(
         Authentication auth) {
     User user = userRepository.findByUsername(auth.getName()).orElseThrow();
     service.markAllAsRead(user.getId());
     return ResponseEntity.ok(ApiResponse.success("All marked as read"));
 }

 @DeleteMapping("/{id}")
 public ResponseEntity<ApiResponse<String>> delete(@PathVariable Long id) {
     service.deleteNotification(id);
     return ResponseEntity.ok(ApiResponse.success("Deleted"));
 }

 @DeleteMapping("/clear-read")
 public ResponseEntity<ApiResponse<String>> clearRead(Authentication auth) {
     User user = userRepository.findByUsername(auth.getName()).orElseThrow();
     service.deleteAllRead(user.getId());
     return ResponseEntity.ok(ApiResponse.success("Cleared"));
 }
}