package com.hrms.controller;

import com.hrms.dto.response.ApiResponse;
import com.hrms.dto.response.AssignmentResponse;
import com.hrms.dto.response.BreakSessionResponse;
import com.hrms.dto.response.DailyWorkDashboard;
import com.hrms.model.AssignmentComment;
import com.hrms.model.DailyWorkAssignment;
import com.hrms.model.User;
import com.hrms.repository.UserRepository;
import com.hrms.service.DailyWorkService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/daily-work")
@RequiredArgsConstructor
public class DailyWorkController {

    private final DailyWorkService service;
    private final UserRepository userRepository;

    private User getUser(Authentication auth) {
        return userRepository.findByUsername(auth.getName()).orElseThrow();
    }

    @PostMapping("/assignments")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<AssignmentResponse>> create(@RequestBody DailyWorkAssignment req, Authentication auth) {
        return ResponseEntity.ok(ApiResponse.success("Created", service.createAssignment(req, getUser(auth).getId())));
    }

    @PutMapping("/assignments/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','EMPLOYEE')")
    public ResponseEntity<ApiResponse<AssignmentResponse>> update(@PathVariable Long id, @RequestBody DailyWorkAssignment req) {
        return ResponseEntity.ok(ApiResponse.success("Updated", service.updateAssignment(id, req)));
    }

    @GetMapping("/assignments")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<AssignmentResponse>>> getAll(@RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(ApiResponse.success("Success", date != null ? service.getAssignmentsByDate(date) : service.getAssignmentsByDate(LocalDate.now())));
    }

    @GetMapping("/assignments/my/{empId}")
    @PreAuthorize("hasAnyRole('ADMIN','EMPLOYEE')")
    public ResponseEntity<ApiResponse<List<AssignmentResponse>>> getMy(@PathVariable Long empId) {
        return ResponseEntity.ok(ApiResponse.success("Success", service.getMyAssignments(empId)));
    }

    @DeleteMapping("/assignments/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<String>> delete(@PathVariable Long id) {
        service.deleteAssignment(id);
        return ResponseEntity.ok(ApiResponse.success("Deleted"));
    }

    // WORKFLOW
    @PatchMapping("/assignments/{id}/accept")
    public ResponseEntity<ApiResponse<AssignmentResponse>> accept(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Accepted", service.acceptAssignment(id)));
    }

    @PatchMapping("/assignments/{id}/start")
    public ResponseEntity<ApiResponse<AssignmentResponse>> start(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Started", service.startTask(id)));
    }

    @PatchMapping("/assignments/{id}/pause")
    public ResponseEntity<ApiResponse<AssignmentResponse>> pause(@PathVariable Long id, @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(ApiResponse.success("Paused", service.pauseTask(id, body.get("reason"))));
    }

    @PatchMapping("/assignments/{id}/block")
    public ResponseEntity<ApiResponse<AssignmentResponse>> block(@PathVariable Long id, @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(ApiResponse.success("Blocked", service.blockTask(id, body.get("blockerReason"))));
    }

    @PatchMapping("/assignments/{id}/resume")
    public ResponseEntity<ApiResponse<AssignmentResponse>> resume(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Resumed", service.resumeTask(id)));
    }

    @PatchMapping("/assignments/{id}/complete")
    public ResponseEntity<ApiResponse<AssignmentResponse>> complete(@PathVariable Long id, @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(ApiResponse.success("Completed", service.completeTask(id, body.get("notes"))));
    }

    @PatchMapping("/assignments/{id}/progress")
    public ResponseEntity<ApiResponse<AssignmentResponse>> progress(@PathVariable Long id, @RequestBody Map<String, Integer> body) {
        return ResponseEntity.ok(ApiResponse.success("Updated", service.updateProgress(id, body.get("percentage"))));
    }

    // COMMENTS
    @PostMapping("/assignments/{id}/comments")
    public ResponseEntity<ApiResponse<AssignmentComment>> addComment(@PathVariable Long id, @RequestBody Map<String, String> body, Authentication auth) {
        return ResponseEntity.ok(ApiResponse.success("Added", service.addComment(id, getUser(auth).getId(), body.get("comment"), body.get("type"))));
    }

    @GetMapping("/assignments/{id}/comments")
    public ResponseEntity<ApiResponse<List<AssignmentComment>>> getComments(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Success", service.getComments(id)));
    }

    // BREAKS
    @PostMapping("/breaks/start")
    public ResponseEntity<ApiResponse<BreakSessionResponse>> startBreak(@RequestBody Map<String, String> body) {
        return ResponseEntity.ok(ApiResponse.success("Break Started", service.startBreak(Long.valueOf(body.get("employeeId")), body.get("breakType"), body.get("reason"), body.get("location"))));
    }

    @PatchMapping("/breaks/{id}/end")
    public ResponseEntity<ApiResponse<BreakSessionResponse>> endBreak(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Break Ended", service.endBreak(id)));
    }

    @GetMapping("/breaks/active")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<BreakSessionResponse>>> activeBreaks() {
        return ResponseEntity.ok(ApiResponse.success("Success", service.getActiveBreaks()));
    }

    @PatchMapping("/breaks/{id}/force-end")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<BreakSessionResponse>> forceEndBreak(@PathVariable Long id, @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(ApiResponse.success("Break Ended", service.forceEndBreak(id, body.get("adminNote"))));
    }

    // DASHBOARD
    @GetMapping("/dashboard/my/{empId}")
    public ResponseEntity<ApiResponse<DailyWorkDashboard>> myDash(@PathVariable Long empId) {
        return ResponseEntity.ok(ApiResponse.success("Success", service.getMyDashboard(empId)));
    }

    @GetMapping("/dashboard/team")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> teamDash() {
        return ResponseEntity.ok(ApiResponse.success("Success", service.getTeamDashboard()));
    }
}