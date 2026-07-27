
//controller/DepartmentController.java
package com.hrms.controller;

import com.hrms.dto.request.DepartmentRequest;
import com.hrms.dto.response.ApiResponse;
import com.hrms.dto.response.DepartmentResponse;
import com.hrms.service.DepartmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/departments")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class DepartmentController {

 private final DepartmentService departmentService;

 @PostMapping
 public ResponseEntity<ApiResponse<DepartmentResponse>> create(
         @Valid @RequestBody DepartmentRequest request) {
     return new ResponseEntity<>(
             ApiResponse.success("Department created successfully",
                     departmentService.createDepartment(request)),
             HttpStatus.CREATED);
 }

 @GetMapping("/{id}")
 public ResponseEntity<ApiResponse<DepartmentResponse>> getById(
         @PathVariable Long id) {
     return ResponseEntity.ok(
             ApiResponse.success("Success",
                     departmentService.getDepartmentById(id)));
 }

 @GetMapping
 public ResponseEntity<ApiResponse<List<DepartmentResponse>>> getAll() {
     return ResponseEntity.ok(
             ApiResponse.success("Success",
                     departmentService.getAllDepartments()));
 }

 @PutMapping("/{id}")
 public ResponseEntity<ApiResponse<DepartmentResponse>> update(
         @PathVariable Long id,
         @Valid @RequestBody DepartmentRequest request) {
     return ResponseEntity.ok(
             ApiResponse.success("Department updated successfully",
                     departmentService.updateDepartment(id, request)));
 }

 @DeleteMapping("/{id}")
 public ResponseEntity<ApiResponse<String>> delete(@PathVariable Long id) {
     departmentService.deleteDepartment(id);
     return ResponseEntity.ok(
             ApiResponse.success("Department deleted successfully"));
 }
}