
//controller/ExpenseController.java
package com.hrms.controller;

import com.hrms.dto.response.ApiResponse;
import com.hrms.dto.response.ExpenseClaimResponse;
import com.hrms.model.ExpenseCategory;
import com.hrms.model.ExpenseClaim;
import com.hrms.model.User;
import com.hrms.repository.UserRepository;
import com.hrms.service.ExpenseService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/expenses")
@RequiredArgsConstructor
public class ExpenseController {

 private final ExpenseService service;
 private final UserRepository userRepository;

 // CATEGORIES
 @PostMapping("/categories")
 @PreAuthorize("hasRole('ADMIN')")
 public ResponseEntity<ApiResponse<ExpenseCategory>> createCategory(
         @RequestBody ExpenseCategory category) {
     return ResponseEntity.ok(ApiResponse.success("Category created",
         service.createCategory(category)));
 }

 @GetMapping("/categories")
 @PreAuthorize("hasAnyRole('ADMIN','EMPLOYEE')")
 public ResponseEntity<ApiResponse<List<ExpenseCategory>>> getCategories() {
     return ResponseEntity.ok(ApiResponse.success("Success",
         service.getAllCategories()));
 }

 @GetMapping("/categories/active")
 @PreAuthorize("hasAnyRole('ADMIN','EMPLOYEE')")
 public ResponseEntity<ApiResponse<List<ExpenseCategory>>> getActiveCategories() {
     return ResponseEntity.ok(ApiResponse.success("Success",
         service.getActiveCategories()));
 }

 @PutMapping("/categories/{id}")
 @PreAuthorize("hasRole('ADMIN')")
 public ResponseEntity<ApiResponse<ExpenseCategory>> updateCategory(
         @PathVariable Long id, @RequestBody ExpenseCategory category) {
     return ResponseEntity.ok(ApiResponse.success("Updated",
         service.updateCategory(id, category)));
 }

 @DeleteMapping("/categories/{id}")
 @PreAuthorize("hasRole('ADMIN')")
 public ResponseEntity<ApiResponse<String>> deleteCategory(
         @PathVariable Long id) {
     service.deleteCategory(id);
     return ResponseEntity.ok(ApiResponse.success("Deleted"));
 }

 // CLAIMS
 @PostMapping("/claims")
 @PreAuthorize("hasAnyRole('ADMIN','EMPLOYEE')")
 public ResponseEntity<ApiResponse<ExpenseClaimResponse>> create(
         @RequestBody ExpenseClaim claim) {
     return ResponseEntity.ok(ApiResponse.success("Claim created",
         service.createClaim(claim)));
 }

 @PutMapping("/claims/{id}")
 @PreAuthorize("hasAnyRole('ADMIN','EMPLOYEE')")
 public ResponseEntity<ApiResponse<ExpenseClaimResponse>> update(
         @PathVariable Long id, @RequestBody ExpenseClaim claim) {
     return ResponseEntity.ok(ApiResponse.success("Updated",
         service.updateClaim(id, claim)));
 }

 @GetMapping("/claims/{id}")
 @PreAuthorize("hasAnyRole('ADMIN','EMPLOYEE')")
 public ResponseEntity<ApiResponse<ExpenseClaimResponse>> getById(
         @PathVariable Long id) {
     return ResponseEntity.ok(ApiResponse.success("Success",
         service.getClaim(id)));
 }

 @GetMapping("/claims")
 @PreAuthorize("hasRole('ADMIN')")
 public ResponseEntity<ApiResponse<List<ExpenseClaimResponse>>> getAll() {
     return ResponseEntity.ok(ApiResponse.success("Success",
         service.getAllClaims()));
 }

 @GetMapping("/claims/employee/{empId}")
 @PreAuthorize("hasAnyRole('ADMIN','EMPLOYEE')")
 public ResponseEntity<ApiResponse<List<ExpenseClaimResponse>>> getByEmployee(
         @PathVariable Long empId) {
     return ResponseEntity.ok(ApiResponse.success("Success",
         service.getClaimsByEmployee(empId)));
 }

 @GetMapping("/claims/status/{status}")
 @PreAuthorize("hasRole('ADMIN')")
 public ResponseEntity<ApiResponse<List<ExpenseClaimResponse>>> getByStatus(
         @PathVariable String status) {
     return ResponseEntity.ok(ApiResponse.success("Success",
         service.getClaimsByStatus(status)));
 }

 @DeleteMapping("/claims/{id}")
 @PreAuthorize("hasAnyRole('ADMIN','EMPLOYEE')")
 public ResponseEntity<ApiResponse<String>> delete(@PathVariable Long id) {
     service.deleteClaim(id);
     return ResponseEntity.ok(ApiResponse.success("Deleted"));
 }

 // WORKFLOW
 @PatchMapping("/claims/{id}/submit")
 @PreAuthorize("hasAnyRole('ADMIN','EMPLOYEE')")
 public ResponseEntity<ApiResponse<ExpenseClaimResponse>> submit(
         @PathVariable Long id) {
     return ResponseEntity.ok(ApiResponse.success("Submitted",
         service.submitClaim(id)));
 }

 @PatchMapping("/claims/{id}/approve")
 @PreAuthorize("hasRole('ADMIN')")
 public ResponseEntity<ApiResponse<ExpenseClaimResponse>> approve(
         @PathVariable Long id, Authentication auth) {
     User user = userRepository.findByUsername(auth.getName()).orElseThrow();
     return ResponseEntity.ok(ApiResponse.success("Approved",
         service.approveClaim(id, user.getId())));
 }

 @PatchMapping("/claims/{id}/reject")
 @PreAuthorize("hasRole('ADMIN')")
 public ResponseEntity<ApiResponse<ExpenseClaimResponse>> reject(
         @PathVariable Long id, @RequestBody Map<String, String> body) {
     return ResponseEntity.ok(ApiResponse.success("Rejected",
         service.rejectClaim(id, body.get("reason"))));
 }

 @PatchMapping("/claims/{id}/reimburse")
 @PreAuthorize("hasRole('ADMIN')")
 public ResponseEntity<ApiResponse<ExpenseClaimResponse>> reimburse(
         @PathVariable Long id, @RequestBody Map<String, Object> body) {
     BigDecimal amount = body.get("amount") != null
         ? new BigDecimal(body.get("amount").toString()) : null;
     return ResponseEntity.ok(ApiResponse.success("Reimbursed",
         service.markReimbursed(id, amount)));
 }

 // ANALYTICS
 @GetMapping("/stats/employee/{empId}")
 @PreAuthorize("hasAnyRole('ADMIN','EMPLOYEE')")
 public ResponseEntity<ApiResponse<Map<String, Object>>> getEmployeeStats(
         @PathVariable Long empId) {
     return ResponseEntity.ok(ApiResponse.success("Success",
         service.getEmployeeStatistics(empId)));
 }

 @GetMapping("/stats/overall")
 @PreAuthorize("hasRole('ADMIN')")
 public ResponseEntity<ApiResponse<Map<String, Object>>> getOverallStats() {
     return ResponseEntity.ok(ApiResponse.success("Success",
         service.getOverallStatistics()));
 }
}