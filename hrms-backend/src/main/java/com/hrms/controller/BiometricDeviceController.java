
//controller/BiometricDeviceController.java
package com.hrms.controller;

import com.hrms.dto.request.BiometricSyncRequest;
import com.hrms.dto.response.ApiResponse;
import com.hrms.model.BiometricDevice;
import com.hrms.service.BiometricDeviceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/biometric-devices")
@RequiredArgsConstructor
public class BiometricDeviceController {

 private final BiometricDeviceService service;

 @PostMapping
 @PreAuthorize("hasRole('ADMIN')")
 public ResponseEntity<ApiResponse<BiometricDevice>> create(
         @RequestBody BiometricDevice device) {
     return ResponseEntity.ok(ApiResponse.success("Device created",
         service.createDevice(device)));
 }

 @GetMapping
 @PreAuthorize("hasRole('ADMIN')")
 public ResponseEntity<ApiResponse<List<BiometricDevice>>> getAll() {
     return ResponseEntity.ok(ApiResponse.success("Success",
         service.getAllDevices()));
 }

 @GetMapping("/{id}")
 @PreAuthorize("hasRole('ADMIN')")
 public ResponseEntity<ApiResponse<BiometricDevice>> getById(
         @PathVariable Long id) {
     return ResponseEntity.ok(ApiResponse.success("Success",
         service.getById(id)));
 }

 @PutMapping("/{id}")
 @PreAuthorize("hasRole('ADMIN')")
 public ResponseEntity<ApiResponse<BiometricDevice>> update(
         @PathVariable Long id, @RequestBody BiometricDevice device) {
     return ResponseEntity.ok(ApiResponse.success("Updated",
         service.updateDevice(id, device)));
 }

 @DeleteMapping("/{id}")
 @PreAuthorize("hasRole('ADMIN')")
 public ResponseEntity<ApiResponse<String>> delete(@PathVariable Long id) {
     service.deleteDevice(id);
     return ResponseEntity.ok(ApiResponse.success("Deleted"));
 }

 // Public endpoint - Device authenticates via API key
 @PostMapping("/sync")
 public ResponseEntity<ApiResponse<Map<String, Object>>> sync(
         @RequestBody BiometricSyncRequest request) {
     return ResponseEntity.ok(ApiResponse.success("Sync completed",
         service.syncAttendanceFromDevice(request)));
 }

 @PostMapping("/{id}/test-connection")
 @PreAuthorize("hasRole('ADMIN')")
 public ResponseEntity<ApiResponse<Map<String, Object>>> testConnection(
         @PathVariable Long id) {
     return ResponseEntity.ok(ApiResponse.success("Test completed",
         service.testConnection(id)));
 }
}