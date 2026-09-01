
//service/impl/ExpenseServiceImpl.java
package com.hrms.service.impl;

import com.hrms.dto.response.ExpenseClaimResponse;
import com.hrms.exception.HrmsAPIException;
import com.hrms.exception.ResourceNotFoundException;
import com.hrms.model.*;
import com.hrms.repository.*;
import com.hrms.service.ExpenseService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ExpenseServiceImpl implements ExpenseService {

 private final ExpenseCategoryRepository categoryRepository;
 private final ExpenseClaimRepository claimRepository;
 private final EmployeeRepository employeeRepository;
 private final ProjectRepository projectRepository;

 @Override
 @Transactional
 public ExpenseCategory createCategory(ExpenseCategory category) {
     if (categoryRepository.existsByName(category.getName())) {
         throw new HrmsAPIException(HttpStatus.BAD_REQUEST,
             "Category with this name already exists");
     }
     return categoryRepository.save(category);
 }

 @Override
 @Transactional
 public ExpenseCategory updateCategory(Long id, ExpenseCategory category) {
     ExpenseCategory existing = categoryRepository.findById(id)
             .orElseThrow(() -> new ResourceNotFoundException(
                 "Category", "id", id));

     existing.setName(category.getName());
     existing.setDescription(category.getDescription());
     existing.setMaxAmount(category.getMaxAmount());
     existing.setRequiresReceipt(category.getRequiresReceipt());
     existing.setIsActive(category.getIsActive());
     return categoryRepository.save(existing);
 }

 @Override
 public List<ExpenseCategory> getAllCategories() {
     return categoryRepository.findAll();
 }

 @Override
 public List<ExpenseCategory> getActiveCategories() {
     return categoryRepository.findByIsActiveTrue();
 }

 @Override
 public void deleteCategory(Long id) {
     categoryRepository.deleteById(id);
 }

 @Override
 @Transactional
 public ExpenseClaimResponse createClaim(ExpenseClaim claim) {
     // Validate category
     ExpenseCategory category = categoryRepository
             .findById(claim.getCategoryId())
             .orElseThrow(() -> new ResourceNotFoundException(
                 "Category", "id", claim.getCategoryId()));

     // Check max amount
     if (category.getMaxAmount() != null &&
         claim.getAmount().compareTo(category.getMaxAmount()) > 0) {
         throw new HrmsAPIException(HttpStatus.BAD_REQUEST,
             "Amount exceeds category limit of " + category.getMaxAmount());
     }

     // Check receipt requirement
     if (category.getRequiresReceipt() &&
         (claim.getReceiptUrl() == null || claim.getReceiptUrl().isEmpty())) {
         log.warn("Receipt required but not uploaded for claim");
     }

     claim.setClaimNumber(generateClaimNumber());
     claim.setStatus(ExpenseClaim.Status.DRAFT);

     return mapToResponse(claimRepository.save(claim));
 }

 @Override
 @Transactional
 public ExpenseClaimResponse updateClaim(Long id, ExpenseClaim claim) {
     ExpenseClaim existing = claimRepository.findById(id)
             .orElseThrow(() -> new ResourceNotFoundException(
                 "Claim", "id", id));

     if (existing.getStatus() != ExpenseClaim.Status.DRAFT &&
         existing.getStatus() != ExpenseClaim.Status.REJECTED) {
         throw new HrmsAPIException(HttpStatus.BAD_REQUEST,
             "Only DRAFT or REJECTED claims can be edited");
     }

     existing.setCategoryId(claim.getCategoryId());
     existing.setProjectId(claim.getProjectId());
     existing.setExpenseDate(claim.getExpenseDate());
     existing.setAmount(claim.getAmount());
     existing.setCurrency(claim.getCurrency());
     existing.setDescription(claim.getDescription());
     existing.setVendor(claim.getVendor());
     existing.setPaymentMethod(claim.getPaymentMethod());
     existing.setReceiptUrl(claim.getReceiptUrl());
     existing.setNotes(claim.getNotes());

     // If was rejected, reset to draft
     if (existing.getStatus() == ExpenseClaim.Status.REJECTED) {
         existing.setStatus(ExpenseClaim.Status.DRAFT);
         existing.setRejectedReason(null);
     }

     return mapToResponse(claimRepository.save(existing));
 }

 @Override
 public ExpenseClaimResponse getClaim(Long id) {
     return mapToResponse(claimRepository.findById(id)
             .orElseThrow(() -> new ResourceNotFoundException(
                 "Claim", "id", id)));
 }

 @Override
 public List<ExpenseClaimResponse> getAllClaims() {
     return claimRepository.findAllByOrderByCreatedAtDesc()
             .stream().map(this::mapToResponse)
             .collect(Collectors.toList());
 }

 @Override
 public List<ExpenseClaimResponse> getClaimsByEmployee(Long employeeId) {
     return claimRepository.findByEmployeeIdOrderByExpenseDateDesc(employeeId)
             .stream().map(this::mapToResponse)
             .collect(Collectors.toList());
 }

 @Override
 public List<ExpenseClaimResponse> getClaimsByStatus(String status) {
     return claimRepository
             .findByStatusOrderByCreatedAtDesc(
                 ExpenseClaim.Status.valueOf(status))
             .stream().map(this::mapToResponse)
             .collect(Collectors.toList());
 }

 @Override
 public void deleteClaim(Long id) {
     ExpenseClaim claim = claimRepository.findById(id)
             .orElseThrow(() -> new ResourceNotFoundException(
                 "Claim", "id", id));

     if (claim.getStatus() != ExpenseClaim.Status.DRAFT) {
         throw new HrmsAPIException(HttpStatus.BAD_REQUEST,
             "Only DRAFT claims can be deleted");
     }
     claimRepository.deleteById(id);
 }

 @Override
 @Transactional
 public ExpenseClaimResponse submitClaim(Long id) {
     ExpenseClaim claim = claimRepository.findById(id)
             .orElseThrow(() -> new ResourceNotFoundException(
                 "Claim", "id", id));

     claim.setStatus(ExpenseClaim.Status.SUBMITTED);
     claim.setSubmittedAt(LocalDateTime.now());
     return mapToResponse(claimRepository.save(claim));
 }

 @Override
 @Transactional
 public ExpenseClaimResponse approveClaim(Long id, Long approverId) {
     ExpenseClaim claim = claimRepository.findById(id)
             .orElseThrow(() -> new ResourceNotFoundException(
                 "Claim", "id", id));

     claim.setStatus(ExpenseClaim.Status.APPROVED);
     claim.setApprovedBy(approverId);
     claim.setApprovedAt(LocalDateTime.now());
     return mapToResponse(claimRepository.save(claim));
 }

 @Override
 @Transactional
 public ExpenseClaimResponse rejectClaim(Long id, String reason) {
     ExpenseClaim claim = claimRepository.findById(id)
             .orElseThrow(() -> new ResourceNotFoundException(
                 "Claim", "id", id));

     claim.setStatus(ExpenseClaim.Status.REJECTED);
     claim.setRejectedReason(reason);
     return mapToResponse(claimRepository.save(claim));
 }

 @Override
 @Transactional
 public ExpenseClaimResponse markReimbursed(Long id, BigDecimal amount) {
     ExpenseClaim claim = claimRepository.findById(id)
             .orElseThrow(() -> new ResourceNotFoundException(
                 "Claim", "id", id));

     if (claim.getStatus() != ExpenseClaim.Status.APPROVED) {
         throw new HrmsAPIException(HttpStatus.BAD_REQUEST,
             "Only APPROVED claims can be reimbursed");
     }

     claim.setStatus(ExpenseClaim.Status.REIMBURSED);
     claim.setReimbursedAmount(amount != null ? amount : claim.getAmount());
     claim.setReimbursedAt(LocalDateTime.now());
     return mapToResponse(claimRepository.save(claim));
 }

 @Override
 public Map<String, Object> getEmployeeStatistics(Long employeeId) {
     Map<String, Object> stats = new HashMap<>();
     LocalDate now = LocalDate.now();
     LocalDate monthStart = now.withDayOfMonth(1);
     LocalDate yearStart = now.withDayOfYear(1);

     BigDecimal monthTotal = claimRepository
             .sumApprovedByEmployeeAndDateRange(employeeId, monthStart, now);
     BigDecimal yearTotal = claimRepository
             .sumApprovedByEmployeeAndDateRange(employeeId, yearStart, now);

     stats.put("monthTotal", monthTotal != null ? monthTotal : BigDecimal.ZERO);
     stats.put("yearTotal", yearTotal != null ? yearTotal : BigDecimal.ZERO);

     List<ExpenseClaim> all = claimRepository
             .findByEmployeeIdOrderByExpenseDateDesc(employeeId);

     stats.put("total", all.size());
     stats.put("draftCount", all.stream()
         .filter(c -> c.getStatus() == ExpenseClaim.Status.DRAFT).count());
     stats.put("submittedCount", all.stream()
         .filter(c -> c.getStatus() == ExpenseClaim.Status.SUBMITTED).count());
     stats.put("approvedCount", all.stream()
         .filter(c -> c.getStatus() == ExpenseClaim.Status.APPROVED).count());
     stats.put("reimbursedCount", all.stream()
         .filter(c -> c.getStatus() == ExpenseClaim.Status.REIMBURSED).count());

     return stats;
 }

 @Override
 public Map<String, Object> getOverallStatistics() {
     Map<String, Object> stats = new HashMap<>();

     stats.put("totalClaims", claimRepository.count());
     stats.put("pendingCount",
         claimRepository.countByStatus(ExpenseClaim.Status.SUBMITTED));
     stats.put("approvedCount",
         claimRepository.countByStatus(ExpenseClaim.Status.APPROVED));
     stats.put("reimbursedCount",
         claimRepository.countByStatus(ExpenseClaim.Status.REIMBURSED));

     BigDecimal totalPending = claimRepository
             .sumByStatus(ExpenseClaim.Status.SUBMITTED);
     BigDecimal totalApproved = claimRepository
             .sumByStatus(ExpenseClaim.Status.APPROVED);
     BigDecimal totalReimbursed = claimRepository
             .sumByStatus(ExpenseClaim.Status.REIMBURSED);

     stats.put("totalPendingAmount",
         totalPending != null ? totalPending : BigDecimal.ZERO);
     stats.put("totalApprovedAmount",
         totalApproved != null ? totalApproved : BigDecimal.ZERO);
     stats.put("totalReimbursedAmount",
         totalReimbursed != null ? totalReimbursed : BigDecimal.ZERO);

     return stats;
 }

 private String generateClaimNumber() {
     long count = claimRepository.count() + 1;
     return String.format("EXP-%d-%05d", LocalDate.now().getYear(), count);
 }

 private ExpenseClaimResponse mapToResponse(ExpenseClaim c) {
     String categoryName = categoryRepository.findById(c.getCategoryId())
             .map(ExpenseCategory::getName).orElse("Unknown");

     String projectName = "";
     if (c.getProjectId() != null) {
         projectName = projectRepository.findById(c.getProjectId())
                 .map(Project::getName).orElse("");
     }

     return ExpenseClaimResponse.builder()
             .id(c.getId())
             .claimNumber(c.getClaimNumber())
             .employeeId(c.getEmployee().getId())
             .employeeName(c.getEmployee().getFullName())
             .employeeCode(c.getEmployee().getEmployeeId())
             .categoryId(c.getCategoryId())
             .categoryName(categoryName)
             .projectId(c.getProjectId())
             .projectName(projectName)
             .expenseDate(c.getExpenseDate())
             .amount(c.getAmount())
             .currency(c.getCurrency())
             .description(c.getDescription())
             .vendor(c.getVendor())
             .paymentMethod(c.getPaymentMethod().name())
             .receiptUrl(c.getReceiptUrl())
             .status(c.getStatus().name())
             .submittedAt(c.getSubmittedAt())
             .approvedBy(c.getApprovedBy())
             .approvedAt(c.getApprovedAt())
             .rejectedReason(c.getRejectedReason())
             .reimbursedAt(c.getReimbursedAt())
             .reimbursedAmount(c.getReimbursedAmount())
             .notes(c.getNotes())
             .createdAt(c.getCreatedAt())
             .build();
 }
}