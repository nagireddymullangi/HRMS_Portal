
//controller/AttendanceController.java
package com.hrms.controller;

import com.hrms.dto.request.AttendanceRequest;
import com.hrms.dto.response.ApiResponse;
import com.hrms.dto.response.AttendanceResponse;
import com.hrms.service.AttendanceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/attendance")
@RequiredArgsConstructor
public class AttendanceController {

 private final AttendanceService attendanceService;

 @PostMapping("/mark")
 @PreAuthorize("hasAnyRole('ADMIN','EMPLOYEE')")
 public ResponseEntity<ApiResponse<AttendanceResponse>> mark(
         @Valid @RequestBody AttendanceRequest request) {
     return new ResponseEntity<>(
             ApiResponse.success("Attendance marked successfully",
                     attendanceService.markAttendance(request)),
             HttpStatus.CREATED);
 }

 @PutMapping("/{id}")
 @PreAuthorize("hasRole('ADMIN')")
 public ResponseEntity<ApiResponse<AttendanceResponse>> update(
         @PathVariable Long id,
         @RequestBody AttendanceRequest request) {
     return ResponseEntity.ok(
             ApiResponse.success("Attendance updated",
                     attendanceService.updateAttendance(id, request)));
 }

 @GetMapping("/{id}")
 @PreAuthorize("hasAnyRole('ADMIN','EMPLOYEE')")
 public ResponseEntity<ApiResponse<AttendanceResponse>> getById(
         @PathVariable Long id) {
     return ResponseEntity.ok(
             ApiResponse.success("Success",
                     attendanceService.getAttendanceById(id)));
 }

 @GetMapping("/employee/{employeeId}")
 @PreAuthorize("hasAnyRole('ADMIN','EMPLOYEE')")
 public ResponseEntity<ApiResponse<List<AttendanceResponse>>> getByEmployee(
         @PathVariable Long employeeId,
         @RequestParam(required = false)
         @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
         @RequestParam(required = false)
         @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {

     List<AttendanceResponse> data;
     if (startDate != null && endDate != null) {
         data = attendanceService.getAttendanceByEmployeeAndDateRange(
                 employeeId, startDate, endDate);
     } else {
         data = attendanceService.getAttendanceByEmployee(employeeId);
     }
     return ResponseEntity.ok(ApiResponse.success("Success", data));
 }

 @GetMapping("/all")
 @PreAuthorize("hasRole('ADMIN')")
 public ResponseEntity<ApiResponse<List<AttendanceResponse>>> getAll(
         @RequestParam(required = false)
         @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
     List<AttendanceResponse> data = date != null ?
             attendanceService.getAllAttendanceByDate(date) :
             attendanceService.getAllAttendance();
     return ResponseEntity.ok(ApiResponse.success("Success", data));
 }

 @GetMapping("/summary/{employeeId}")
 @PreAuthorize("hasAnyRole('ADMIN','EMPLOYEE')")
 public ResponseEntity<ApiResponse<Map<String, Long>>> getSummary(
         @PathVariable Long employeeId,
         @RequestParam int month,
         @RequestParam int year) {
     return ResponseEntity.ok(
             ApiResponse.success("Success",
                     attendanceService.getAttendanceSummary(
                             employeeId, month, year)));
 }

 @DeleteMapping("/{id}")
 @PreAuthorize("hasRole('ADMIN')")
 public ResponseEntity<ApiResponse<String>> delete(@PathVariable Long id) {
     attendanceService.deleteAttendance(id);
     return ResponseEntity.ok(
             ApiResponse.success("Attendance record deleted"));
 }
}