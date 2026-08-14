
//controller/ShiftController.java
package com.hrms.controller;

import com.hrms.dto.response.ApiResponse;
import com.hrms.model.*;
import com.hrms.service.ShiftService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/shifts")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class ShiftController {

 private final ShiftService service;

 @PostMapping
 public ResponseEntity<ApiResponse<Shift>> create(@RequestBody Shift shift) {
     return ResponseEntity.ok(ApiResponse.success("Created",
         service.createShift(shift)));
 }

 @GetMapping
 public ResponseEntity<ApiResponse<List<Shift>>> getAll() {
     return ResponseEntity.ok(ApiResponse.success("Success",
         service.getAllShifts()));
 }

 @PutMapping("/{id}")
 public ResponseEntity<ApiResponse<Shift>> update(
         @PathVariable Long id, @RequestBody Shift shift) {
     return ResponseEntity.ok(ApiResponse.success("Updated",
         service.updateShift(id, shift)));
 }

 @DeleteMapping("/{id}")
 public ResponseEntity<ApiResponse<String>> delete(@PathVariable Long id) {
     service.deleteShift(id);
     return ResponseEntity.ok(ApiResponse.success("Deleted"));
 }

 @PostMapping("/assign")
 public ResponseEntity<ApiResponse<EmployeeShift>> assign(
         @RequestBody Map<String, Object> body) {
     Long empId = Long.valueOf(body.get("employeeId").toString());
     Long shiftId = Long.valueOf(body.get("shiftId").toString());
     LocalDate from = LocalDate.parse(body.get("effectiveFrom").toString());
     return ResponseEntity.ok(ApiResponse.success("Assigned",
         service.assignShift(empId, shiftId, from)));
 }

 @GetMapping("/roster")
 public ResponseEntity<ApiResponse<List<Map<String, Object>>>> roster() {
     return ResponseEntity.ok(ApiResponse.success("Success",
         service.getRoster()));
 }

 @PostMapping("/overtime")
 @PreAuthorize("hasAnyRole('ADMIN','EMPLOYEE')")
 public ResponseEntity<ApiResponse<OvertimeRecord>> addOvertime(
         @RequestBody OvertimeRecord record) {
     return ResponseEntity.ok(ApiResponse.success("Created",
         service.createOvertime(record)));
 }

 @GetMapping("/overtime")
 public ResponseEntity<ApiResponse<List<OvertimeRecord>>> allOvertime() {
     return ResponseEntity.ok(ApiResponse.success("Success",
         service.getAllOvertime()));
 }

 @PatchMapping("/overtime/{id}")
 public ResponseEntity<ApiResponse<OvertimeRecord>> approve(
         @PathVariable Long id, @RequestParam String status) {
     return ResponseEntity.ok(ApiResponse.success("Updated",
         service.approveOvertime(id, status)));
 }
}