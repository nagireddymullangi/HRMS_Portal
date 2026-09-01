
//controller/AIInsightsController.java
package com.hrms.controller;

import com.hrms.dto.response.AIInsightsResponse;
import com.hrms.dto.response.ApiResponse;
import com.hrms.service.AIInsightsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/ai-insights")
@RequiredArgsConstructor
public class AIInsightsController {

 private final AIInsightsService service;

 @GetMapping("/comprehensive")
 @PreAuthorize("hasRole('ADMIN')")
 public ResponseEntity<ApiResponse<AIInsightsResponse>> getComprehensive() {
     return ResponseEntity.ok(ApiResponse.success("Success",
         service.getComprehensiveInsights()));
 }

 @GetMapping("/attrition-risks")
 @PreAuthorize("hasRole('ADMIN')")
 public ResponseEntity<ApiResponse<List<Map<String, Object>>>>
         getAttritionRisks() {
     return ResponseEntity.ok(ApiResponse.success("Success",
         service.predictAttritionRisks()));
 }

 @GetMapping("/sentiment")
 @PreAuthorize("hasRole('ADMIN')")
 public ResponseEntity<ApiResponse<Map<String, Object>>> getSentiment() {
     return ResponseEntity.ok(ApiResponse.success("Success",
         service.analyzeSentiment()));
 }

 @GetMapping("/top-performers")
 @PreAuthorize("hasRole('ADMIN')")
 public ResponseEntity<ApiResponse<List<Map<String, Object>>>>
         getTopPerformers(@RequestParam(defaultValue = "10") int limit) {
     return ResponseEntity.ok(ApiResponse.success("Success",
         service.getTopPerformers(limit)));
 }

 @GetMapping("/attendance-anomalies")
 @PreAuthorize("hasRole('ADMIN')")
 public ResponseEntity<ApiResponse<List<Map<String, Object>>>>
         getAttendanceAnomalies() {
     return ResponseEntity.ok(ApiResponse.success("Success",
         service.getAttendanceAnomalies()));
 }

 @GetMapping("/recommendations")
 @PreAuthorize("hasRole('ADMIN')")
 public ResponseEntity<ApiResponse<List<Map<String, Object>>>>
         getRecommendations() {
     return ResponseEntity.ok(ApiResponse.success("Success",
         service.getSmartRecommendations()));
 }

 @GetMapping("/salary-benchmarks")
 @PreAuthorize("hasRole('ADMIN')")
 public ResponseEntity<ApiResponse<Map<String, Object>>> getBenchmarks() {
     return ResponseEntity.ok(ApiResponse.success("Success",
         service.getSalaryBenchmarks()));
 }

 @GetMapping("/skill-gaps")
 @PreAuthorize("hasRole('ADMIN')")
 public ResponseEntity<ApiResponse<List<Map<String, Object>>>>
         getSkillGaps() {
     return ResponseEntity.ok(ApiResponse.success("Success",
         service.getSkillGaps()));
 }

 @PostMapping("/chatbot")
 @PreAuthorize("hasAnyRole('ADMIN','EMPLOYEE')")
 public ResponseEntity<ApiResponse<Map<String, Object>>> chatbot(
         @RequestBody Map<String, String> body) {
     return ResponseEntity.ok(ApiResponse.success("Success",
         service.chatbotResponse(body.get("query"))));
 }
}