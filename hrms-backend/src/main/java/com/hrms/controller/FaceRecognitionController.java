
//controller/FaceRecognitionController.java
package com.hrms.controller;

import com.hrms.dto.request.FaceAttendanceRequest;
import com.hrms.dto.request.FaceEnrollmentRequest;
import com.hrms.dto.response.ApiResponse;
import com.hrms.dto.response.AttendanceResponse;
import com.hrms.dto.response.FaceVerificationResponse;
import com.hrms.model.FaceEnrollment;
import com.hrms.service.FaceRecognitionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/face-recognition")
@RequiredArgsConstructor
public class FaceRecognitionController {

 private final FaceRecognitionService service;

 @PostMapping("/enroll")
 @PreAuthorize("hasAnyRole('ADMIN','EMPLOYEE')")
 public ResponseEntity<ApiResponse<FaceEnrollment>> enroll(
         @Valid @RequestBody FaceEnrollmentRequest request) {
     return ResponseEntity.ok(ApiResponse.success(
         "Face enrolled successfully", service.enrollFace(request)));
 }

 @PutMapping("/enroll/{employeeId}")
 @PreAuthorize("hasAnyRole('ADMIN','EMPLOYEE')")
 public ResponseEntity<ApiResponse<FaceEnrollment>> updateEnrollment(
         @PathVariable Long employeeId,
         @Valid @RequestBody FaceEnrollmentRequest request) {
     return ResponseEntity.ok(ApiResponse.success("Updated",
         service.updateEnrollment(employeeId, request)));
 }

 @GetMapping("/enrollment/{employeeId}")
 @PreAuthorize("hasAnyRole('ADMIN','EMPLOYEE')")
 public ResponseEntity<ApiResponse<FaceEnrollment>> getEnrollment(
         @PathVariable Long employeeId) {
     return ResponseEntity.ok(ApiResponse.success("Success",
         service.getEnrollment(employeeId)));
 }

 @GetMapping("/enrollments")
 @PreAuthorize("hasRole('ADMIN')")
 public ResponseEntity<ApiResponse<List<FaceEnrollment>>> getAll() {
     return ResponseEntity.ok(ApiResponse.success("Success",
         service.getAllEnrollments()));
 }

 @DeleteMapping("/enrollment/{employeeId}")
 @PreAuthorize("hasRole('ADMIN')")
 public ResponseEntity<ApiResponse<String>> delete(
         @PathVariable Long employeeId) {
     service.deleteEnrollment(employeeId);
     return ResponseEntity.ok(ApiResponse.success("Enrollment deleted"));
 }

 @PostMapping("/verify")
 @PreAuthorize("hasAnyRole('ADMIN','EMPLOYEE')")
 public ResponseEntity<ApiResponse<FaceVerificationResponse>> verify(
         @RequestBody Map<String, Object> body) {
     String descriptor = (String) body.get("faceDescriptor");
     Double threshold = body.get("threshold") != null ?
         Double.valueOf(body.get("threshold").toString()) : null;
     return ResponseEntity.ok(ApiResponse.success("Verified",
         service.verifyFace(descriptor, threshold)));
 }

 @PostMapping("/mark-attendance")
 @PreAuthorize("hasAnyRole('ADMIN','EMPLOYEE')")
 public ResponseEntity<ApiResponse<AttendanceResponse>> markAttendance(
         @Valid @RequestBody FaceAttendanceRequest request) {
     return ResponseEntity.ok(ApiResponse.success("Attendance marked",
         service.markAttendanceWithFace(request)));
 }

 @GetMapping("/is-enrolled/{employeeId}")
 @PreAuthorize("hasAnyRole('ADMIN','EMPLOYEE')")
 public ResponseEntity<ApiResponse<Map<String, Boolean>>> isEnrolled(
         @PathVariable Long employeeId) {
     Map<String, Boolean> result = Map.of(
         "enrolled", service.isEnrolled(employeeId));
     return ResponseEntity.ok(ApiResponse.success("Success", result));
 }
}