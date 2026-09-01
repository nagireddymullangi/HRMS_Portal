
//controller/ProjectController.java
package com.hrms.controller;

import com.hrms.dto.response.ApiResponse;
import com.hrms.dto.response.ProjectResponse;
import com.hrms.model.Project;
import com.hrms.model.ProjectMember;
import com.hrms.model.ProjectTask;
import com.hrms.service.ProjectService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
public class ProjectController {

 private final ProjectService service;

 @PostMapping
 @PreAuthorize("hasRole('ADMIN')")
 public ResponseEntity<ApiResponse<ProjectResponse>> create(
         @RequestBody Project project) {
     return ResponseEntity.ok(ApiResponse.success("Project created",
         service.createProject(project)));
 }

 @GetMapping
 @PreAuthorize("hasAnyRole('ADMIN','EMPLOYEE')")
 public ResponseEntity<ApiResponse<List<ProjectResponse>>> getAll() {
     return ResponseEntity.ok(ApiResponse.success("Success",
         service.getAllProjects()));
 }

 @GetMapping("/active")
 @PreAuthorize("hasAnyRole('ADMIN','EMPLOYEE')")
 public ResponseEntity<ApiResponse<List<ProjectResponse>>> getActive() {
     return ResponseEntity.ok(ApiResponse.success("Success",
         service.getActiveProjects()));
 }

 @GetMapping("/{id}")
 @PreAuthorize("hasAnyRole('ADMIN','EMPLOYEE')")
 public ResponseEntity<ApiResponse<ProjectResponse>> getById(
         @PathVariable Long id) {
     return ResponseEntity.ok(ApiResponse.success("Success",
         service.getProject(id)));
 }

 @GetMapping("/employee/{empId}")
 @PreAuthorize("hasAnyRole('ADMIN','EMPLOYEE')")
 public ResponseEntity<ApiResponse<List<ProjectResponse>>> getByEmployee(
         @PathVariable Long empId) {
     return ResponseEntity.ok(ApiResponse.success("Success",
         service.getProjectsByEmployee(empId)));
 }

 @PutMapping("/{id}")
 @PreAuthorize("hasRole('ADMIN')")
 public ResponseEntity<ApiResponse<ProjectResponse>> update(
         @PathVariable Long id, @RequestBody Project project) {
     return ResponseEntity.ok(ApiResponse.success("Updated",
         service.updateProject(id, project)));
 }

 @DeleteMapping("/{id}")
 @PreAuthorize("hasRole('ADMIN')")
 public ResponseEntity<ApiResponse<String>> delete(@PathVariable Long id) {
     service.deleteProject(id);
     return ResponseEntity.ok(ApiResponse.success("Deleted"));
 }

 @PatchMapping("/{id}/status")
 @PreAuthorize("hasRole('ADMIN')")
 public ResponseEntity<ApiResponse<ProjectResponse>> updateStatus(
         @PathVariable Long id, @RequestParam String status) {
     return ResponseEntity.ok(ApiResponse.success("Updated",
         service.updateStatus(id, status)));
 }

 // MEMBERS
 @PostMapping("/{projectId}/members")
 @PreAuthorize("hasRole('ADMIN')")
 public ResponseEntity<ApiResponse<ProjectMember>> addMember(
         @PathVariable Long projectId,
         @RequestBody Map<String, Object> body) {
     Long empId = Long.valueOf(body.get("employeeId").toString());
     String role = (String) body.get("role");
     return ResponseEntity.ok(ApiResponse.success("Member added",
         service.addMember(projectId, empId, role)));
 }

 @DeleteMapping("/{projectId}/members/{employeeId}")
 @PreAuthorize("hasRole('ADMIN')")
 public ResponseEntity<ApiResponse<String>> removeMember(
         @PathVariable Long projectId, @PathVariable Long employeeId) {
     service.removeMember(projectId, employeeId);
     return ResponseEntity.ok(ApiResponse.success("Member removed"));
 }

 @GetMapping("/{projectId}/members")
 @PreAuthorize("hasAnyRole('ADMIN','EMPLOYEE')")
 public ResponseEntity<ApiResponse<List<ProjectMember>>> getMembers(
         @PathVariable Long projectId) {
     return ResponseEntity.ok(ApiResponse.success("Success",
         service.getMembers(projectId)));
 }

 // TASKS
 @PostMapping("/{projectId}/tasks")
 @PreAuthorize("hasAnyRole('ADMIN','EMPLOYEE')")
 public ResponseEntity<ApiResponse<ProjectTask>> createTask(
         @PathVariable Long projectId,
         @RequestBody ProjectTask task) {
     return ResponseEntity.ok(ApiResponse.success("Task created",
         service.createTask(projectId, task)));
 }

 @PutMapping("/tasks/{taskId}")
 @PreAuthorize("hasAnyRole('ADMIN','EMPLOYEE')")
 public ResponseEntity<ApiResponse<ProjectTask>> updateTask(
         @PathVariable Long taskId, @RequestBody ProjectTask task) {
     return ResponseEntity.ok(ApiResponse.success("Updated",
         service.updateTask(taskId, task)));
 }

 @PatchMapping("/tasks/{taskId}/status")
 @PreAuthorize("hasAnyRole('ADMIN','EMPLOYEE')")
 public ResponseEntity<ApiResponse<ProjectTask>> updateTaskStatus(
         @PathVariable Long taskId, @RequestParam String status) {
     return ResponseEntity.ok(ApiResponse.success("Updated",
         service.updateTaskStatus(taskId, status)));
 }

 @GetMapping("/{projectId}/tasks")
 @PreAuthorize("hasAnyRole('ADMIN','EMPLOYEE')")
 public ResponseEntity<ApiResponse<List<ProjectTask>>> getTasks(
         @PathVariable Long projectId) {
     return ResponseEntity.ok(ApiResponse.success("Success",
         service.getTasksByProject(projectId)));
 }

 @GetMapping("/tasks/my/{empId}")
 @PreAuthorize("hasAnyRole('ADMIN','EMPLOYEE')")
 public ResponseEntity<ApiResponse<List<ProjectTask>>> getMyTasks(
         @PathVariable Long empId) {
     return ResponseEntity.ok(ApiResponse.success("Success",
         service.getTasksByEmployee(empId)));
 }

 @DeleteMapping("/tasks/{taskId}")
 @PreAuthorize("hasAnyRole('ADMIN','EMPLOYEE')")
 public ResponseEntity<ApiResponse<String>> deleteTask(
         @PathVariable Long taskId) {
     service.deleteTask(taskId);
     return ResponseEntity.ok(ApiResponse.success("Deleted"));
 }

 @GetMapping("/statistics")
 @PreAuthorize("hasRole('ADMIN')")
 public ResponseEntity<ApiResponse<Map<String, Object>>> getStats() {
     return ResponseEntity.ok(ApiResponse.success("Success",
         service.getStatistics()));
 }
}