
//service/ExpenseService.java
package com.hrms.service;

import com.hrms.dto.response.ExpenseClaimResponse;
import com.hrms.model.ExpenseCategory;
import com.hrms.model.ExpenseClaim;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

public interface ExpenseService {
 // Categories
 ExpenseCategory createCategory(ExpenseCategory category);
 ExpenseCategory updateCategory(Long id, ExpenseCategory category);
 List<ExpenseCategory> getAllCategories();
 List<ExpenseCategory> getActiveCategories();
 void deleteCategory(Long id);

 // Claims
 ExpenseClaimResponse createClaim(ExpenseClaim claim);
 ExpenseClaimResponse updateClaim(Long id, ExpenseClaim claim);
 ExpenseClaimResponse getClaim(Long id);
 List<ExpenseClaimResponse> getAllClaims();
 List<ExpenseClaimResponse> getClaimsByEmployee(Long employeeId);
 List<ExpenseClaimResponse> getClaimsByStatus(String status);
 void deleteClaim(Long id);

 // Workflow
 ExpenseClaimResponse submitClaim(Long id);
 ExpenseClaimResponse approveClaim(Long id, Long approverId);
 ExpenseClaimResponse rejectClaim(Long id, String reason);
 ExpenseClaimResponse markReimbursed(Long id, BigDecimal amount);

 // Analytics
 Map<String, Object> getEmployeeStatistics(Long employeeId);
 Map<String, Object> getOverallStatistics();
}