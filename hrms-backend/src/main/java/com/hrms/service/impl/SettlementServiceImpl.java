
//service/impl/SettlementServiceImpl.java
package com.hrms.service.impl;

import com.hrms.dto.response.FnFSettlementResponse;
import com.hrms.exception.HrmsAPIException;
import com.hrms.exception.ResourceNotFoundException;
import com.hrms.model.*;
import com.hrms.repository.*;
import com.hrms.service.SettlementService;
import com.itextpdf.html2pdf.HtmlConverter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class SettlementServiceImpl implements SettlementService {

 private final FullFinalSettlementRepository settlementRepository;
 private final EmployeeRepository employeeRepository;
 private final PayrollRepository payrollRepository;
 private final EmployeeExitRepository exitRepository;

 @Override
 @Transactional
 public FnFSettlementResponse create(FullFinalSettlement settlement) {
     // Check if already exists
     if (settlementRepository.findByEmployeeId(
             settlement.getEmployee().getId()).isPresent()) {
         throw new HrmsAPIException(HttpStatus.BAD_REQUEST,
             "Settlement already exists for this employee");
     }

     settlement.setSettlementNumber(generateSettlementNumber());
     settlement.setStatus(FullFinalSettlement.Status.DRAFT);
     settlement.calculateTotals();
     return mapToResponse(settlementRepository.save(settlement));
 }

 @Override
 @Transactional
 public FnFSettlementResponse update(Long id, FullFinalSettlement settlement) {
     FullFinalSettlement existing = settlementRepository.findById(id)
             .orElseThrow(() -> new ResourceNotFoundException(
                 "Settlement", "id", id));

     if (existing.getStatus() == FullFinalSettlement.Status.PAID) {
         throw new HrmsAPIException(HttpStatus.BAD_REQUEST,
             "Cannot edit paid settlement");
     }

     // Update fields
     existing.setLastWorkingDate(settlement.getLastWorkingDate());
     existing.setPendingSalary(settlement.getPendingSalary());
     existing.setPendingBonus(settlement.getPendingBonus());
     existing.setLeaveEncashment(settlement.getLeaveEncashment());
     existing.setLeaveEncashmentDays(settlement.getLeaveEncashmentDays());
     existing.setGratuity(settlement.getGratuity());
     existing.setNoticePeriodRecovery(settlement.getNoticePeriodRecovery());
     existing.setOtherEarnings(settlement.getOtherEarnings());
     existing.setOtherEarningsNote(settlement.getOtherEarningsNote());
     existing.setTaxDeduction(settlement.getTaxDeduction());
     existing.setPfDeduction(settlement.getPfDeduction());
     existing.setLoanRecovery(settlement.getLoanRecovery());
     existing.setAdvanceRecovery(settlement.getAdvanceRecovery());
     existing.setAssetRecovery(settlement.getAssetRecovery());
     existing.setAssetRecoveryNote(settlement.getAssetRecoveryNote());
     existing.setOtherDeductions(settlement.getOtherDeductions());
     existing.setOtherDeductionsNote(settlement.getOtherDeductionsNote());
     existing.setNotes(settlement.getNotes());

     existing.calculateTotals();
     return mapToResponse(settlementRepository.save(existing));
 }

 @Override
 public FnFSettlementResponse getById(Long id) {
     return mapToResponse(settlementRepository.findById(id)
             .orElseThrow(() -> new ResourceNotFoundException(
                 "Settlement", "id", id)));
 }

 @Override
 public FnFSettlementResponse getByEmployee(Long employeeId) {
     return mapToResponse(settlementRepository.findByEmployeeId(employeeId)
             .orElseThrow(() -> new ResourceNotFoundException(
                 "Settlement", "employeeId", employeeId)));
 }

 @Override
 public List<FnFSettlementResponse> getAll() {
     return settlementRepository.findAllByOrderByCreatedAtDesc()
             .stream().map(this::mapToResponse)
             .collect(Collectors.toList());
 }

 @Override
 public List<FnFSettlementResponse> getByStatus(String status) {
     return settlementRepository
             .findByStatusOrderByCreatedAtDesc(
                 FullFinalSettlement.Status.valueOf(status))
             .stream().map(this::mapToResponse)
             .collect(Collectors.toList());
 }

 @Override
 public Map<String, Object> autoCalculate(Long employeeId) {
     Employee employee = employeeRepository.findById(employeeId)
             .orElseThrow(() -> new ResourceNotFoundException(
                 "Employee", "id", employeeId));

     Map<String, Object> result = new HashMap<>();
     LocalDate joiningDate = employee.getDateOfJoining();
     LocalDate today = LocalDate.now();

     // Years of service (for gratuity)
     long yearsOfService = joiningDate != null
         ? ChronoUnit.YEARS.between(joiningDate, today) : 0;

     // Get latest payroll for salary calculation
     List<Payroll> payrolls = payrollRepository
             .findByEmployeeIdOrderByYearDescMonthDesc(employeeId);

     BigDecimal basicSalary = payrolls.isEmpty()
         ? BigDecimal.valueOf(30000)
         : payrolls.get(0).getBasicSalary();

     BigDecimal grossSalary = payrolls.isEmpty()
         ? BigDecimal.valueOf(50000)
         : payrolls.get(0).getGrossSalary();

     // Pending salary (for current month if applicable)
     result.put("pendingSalary", grossSalary);

     // Gratuity calculation: (Basic * 15 * Years) / 26
     // Only if 5+ years of service
     BigDecimal gratuity = BigDecimal.ZERO;
     if (yearsOfService >= 5) {
         gratuity = basicSalary
             .multiply(BigDecimal.valueOf(15))
             .multiply(BigDecimal.valueOf(yearsOfService))
             .divide(BigDecimal.valueOf(26), 2, RoundingMode.HALF_UP);
     }
     result.put("gratuity", gratuity);
     result.put("yearsOfService", yearsOfService);

     // Leave encashment (assume 15 days remaining at 500/day)
     int leaveDays = 15;
     BigDecimal leaveEncashment = basicSalary
             .divide(BigDecimal.valueOf(30), 2, RoundingMode.HALF_UP)
             .multiply(BigDecimal.valueOf(leaveDays));
     result.put("leaveEncashment", leaveEncashment);
     result.put("leaveEncashmentDays", leaveDays);

     // Employee info
     result.put("basicSalary", basicSalary);
     result.put("grossSalary", grossSalary);
     result.put("dateOfJoining", joiningDate);
     result.put("employeeName", employee.getFullName());

     return result;
 }

 @Override
 @Transactional
 public FnFSettlementResponse submitForApproval(Long id) {
     FullFinalSettlement s = settlementRepository.findById(id)
             .orElseThrow(() -> new ResourceNotFoundException(
                 "Settlement", "id", id));

     s.setStatus(FullFinalSettlement.Status.PENDING_APPROVAL);
     return mapToResponse(settlementRepository.save(s));
 }

 @Override
 @Transactional
 public FnFSettlementResponse approve(Long id, Long approverId) {
     FullFinalSettlement s = settlementRepository.findById(id)
             .orElseThrow(() -> new ResourceNotFoundException(
                 "Settlement", "id", id));

     s.setStatus(FullFinalSettlement.Status.APPROVED);
     s.setApprovedBy(approverId);
     s.setApprovedAt(LocalDateTime.now());
     return mapToResponse(settlementRepository.save(s));
 }

 @Override
 @Transactional
 public FnFSettlementResponse markPaid(Long id, String paymentReference,
                                         String paymentMode) {
     FullFinalSettlement s = settlementRepository.findById(id)
             .orElseThrow(() -> new ResourceNotFoundException(
                 "Settlement", "id", id));

     if (s.getStatus() != FullFinalSettlement.Status.APPROVED) {
         throw new HrmsAPIException(HttpStatus.BAD_REQUEST,
             "Only APPROVED settlements can be marked as paid");
     }

     s.setStatus(FullFinalSettlement.Status.PAID);
     s.setPaymentReference(paymentReference);
     if (paymentMode != null) {
         s.setPaymentMode(FullFinalSettlement.PaymentMode.valueOf(paymentMode));
     }
     s.setPaidAt(LocalDateTime.now());
     s.setSettlementDate(LocalDate.now());
     return mapToResponse(settlementRepository.save(s));
 }

 @Override
 @Transactional
 public FnFSettlementResponse putOnHold(Long id, String reason) {
     FullFinalSettlement s = settlementRepository.findById(id)
             .orElseThrow(() -> new ResourceNotFoundException(
                 "Settlement", "id", id));

     s.setStatus(FullFinalSettlement.Status.ON_HOLD);
     s.setNotes(reason);
     return mapToResponse(settlementRepository.save(s));
 }

 @Override
 public void delete(Long id) {
     FullFinalSettlement s = settlementRepository.findById(id)
             .orElseThrow(() -> new ResourceNotFoundException(
                 "Settlement", "id", id));

     if (s.getStatus() == FullFinalSettlement.Status.PAID) {
         throw new HrmsAPIException(HttpStatus.BAD_REQUEST,
             "Cannot delete paid settlement");
     }
     settlementRepository.deleteById(id);
 }

 @Override
 public byte[] generatePdf(Long id) {
     FullFinalSettlement s = settlementRepository.findById(id)
             .orElseThrow(() -> new ResourceNotFoundException(
                 "Settlement", "id", id));

     String html = buildSettlementHtml(s);

     try {
         ByteArrayOutputStream baos = new ByteArrayOutputStream();
         HtmlConverter.convertToPdf(html, baos);
         return baos.toByteArray();
     } catch (Exception e) {
         log.error("Failed to generate PDF", e);
         throw new RuntimeException("PDF generation failed");
     }
 }

 @Override
 public Map<String, Object> getStatistics() {
     Map<String, Object> stats = new HashMap<>();
     stats.put("total", settlementRepository.count());
     stats.put("draft", settlementRepository
         .countByStatus(FullFinalSettlement.Status.DRAFT));
     stats.put("pendingApproval", settlementRepository
         .countByStatus(FullFinalSettlement.Status.PENDING_APPROVAL));
     stats.put("approved", settlementRepository
         .countByStatus(FullFinalSettlement.Status.APPROVED));
     stats.put("paid", settlementRepository
         .countByStatus(FullFinalSettlement.Status.PAID));
     stats.put("onHold", settlementRepository
         .countByStatus(FullFinalSettlement.Status.ON_HOLD));
     return stats;
 }

 private String generateSettlementNumber() {
     long count = settlementRepository.count() + 1;
     return String.format("FNF-%d-%05d", LocalDate.now().getYear(), count);
 }

 private FnFSettlementResponse mapToResponse(FullFinalSettlement s) {
     Employee emp = s.getEmployee();
     return FnFSettlementResponse.builder()
             .id(s.getId())
             .settlementNumber(s.getSettlementNumber())
             .employeeId(emp.getId())
             .employeeName(emp.getFullName())
             .employeeCode(emp.getEmployeeId())
             .designation(emp.getDesignation())
             .departmentName(emp.getDepartment() != null
                 ? emp.getDepartment().getName() : null)
             .dateOfJoining(emp.getDateOfJoining())
             .lastWorkingDate(s.getLastWorkingDate())
             .settlementDate(s.getSettlementDate())
             .pendingSalary(s.getPendingSalary())
             .pendingBonus(s.getPendingBonus())
             .leaveEncashment(s.getLeaveEncashment())
             .leaveEncashmentDays(s.getLeaveEncashmentDays())
             .gratuity(s.getGratuity())
             .noticePeriodRecovery(s.getNoticePeriodRecovery())
             .otherEarnings(s.getOtherEarnings())
             .otherEarningsNote(s.getOtherEarningsNote())
             .taxDeduction(s.getTaxDeduction())
             .pfDeduction(s.getPfDeduction())
             .loanRecovery(s.getLoanRecovery())
             .advanceRecovery(s.getAdvanceRecovery())
             .assetRecovery(s.getAssetRecovery())
             .assetRecoveryNote(s.getAssetRecoveryNote())
             .otherDeductions(s.getOtherDeductions())
             .otherDeductionsNote(s.getOtherDeductionsNote())
             .totalEarnings(s.getTotalEarnings())
             .totalDeductions(s.getTotalDeductions())
             .netSettlement(s.getNetSettlement())
             .status(s.getStatus().name())
             .paymentMode(s.getPaymentMode() != null
                 ? s.getPaymentMode().name() : null)
             .paymentReference(s.getPaymentReference())
             .paidAt(s.getPaidAt())
             .approvedAt(s.getApprovedAt())
             .notes(s.getNotes())
             .createdAt(s.getCreatedAt())
             .build();
 }

 private String buildSettlementHtml(FullFinalSettlement s) {
     Employee emp = s.getEmployee();
     return """
     <!DOCTYPE html>
     <html>
     <head>
         <style>
             body { font-family: Arial; padding: 30px; }
             .header { text-align: center; border-bottom: 2px solid #2563eb;
                       padding-bottom: 15px; margin-bottom: 20px; }
             h1 { color: #2563eb; margin: 0; }
             .info { display: flex; justify-content: space-between;
                     margin: 20px 0; }
             .box { border: 1px solid #ddd; padding: 15px;
                    border-radius: 8px; margin: 15px 0; }
             table { width: 100%%; border-collapse: collapse;
                     margin: 10px 0; }
             th, td { text-align: left; padding: 8px;
                      border-bottom: 1px solid #eee; }
             th { background: #f9fafb; color: #374151; }
             .earnings { background: #f0fdf4; }
             .deductions { background: #fef2f2; }
             .total { background: #eff6ff; font-weight: bold;
                      padding: 15px; margin-top: 20px;
                      border-radius: 8px; }
             .net { font-size: 24px; color: #10b981; }
             .footer { text-align: center; margin-top: 40px;
                       font-size: 12px; color: #6b7280;
                       border-top: 1px solid #eee; padding-top: 15px; }
         </style>
     </head>
     <body>
         <div class="header">
             <h1>POTLA TECH SOLUTIONS</h1>
             <p>Full & Final Settlement</p>
             <p><strong>Settlement #:</strong> %s</p>
         </div>

         <div class="info">
             <div>
                 <p><strong>Employee:</strong> %s</p>
                 <p><strong>Employee ID:</strong> %s</p>
                 <p><strong>Designation:</strong> %s</p>
             </div>
             <div>
                 <p><strong>DOJ:</strong> %s</p>
                 <p><strong>Last Working Day:</strong> %s</p>
                 <p><strong>Status:</strong> %s</p>
             </div>
         </div>

         <div class="box earnings">
             <h3 style="color: #10b981;">EARNINGS</h3>
             <table>
                 <tr><td>Pending Salary</td><td>₹ %,.2f</td></tr>
                 <tr><td>Pending Bonus</td><td>₹ %,.2f</td></tr>
                 <tr><td>Leave Encashment (%d days)</td><td>₹ %,.2f</td></tr>
                 <tr><td>Gratuity</td><td>₹ %,.2f</td></tr>
                 <tr><td>Other Earnings</td><td>₹ %,.2f</td></tr>
                 <tr style="font-weight: bold; background: #f0fdf4;">
                     <td>TOTAL EARNINGS</td><td>₹ %,.2f</td>
                 </tr>
             </table>
         </div>

         <div class="box deductions">
             <h3 style="color: #ef4444;">DEDUCTIONS</h3>
             <table>
                 <tr><td>Income Tax</td><td>₹ %,.2f</td></tr>
                 <tr><td>PF Deduction</td><td>₹ %,.2f</td></tr>
                 <tr><td>Loan Recovery</td><td>₹ %,.2f</td></tr>
                 <tr><td>Advance Recovery</td><td>₹ %,.2f</td></tr>
                 <tr><td>Asset Recovery</td><td>₹ %,.2f</td></tr>
                 <tr><td>Notice Period Recovery</td><td>₹ %,.2f</td></tr>
                 <tr><td>Other Deductions</td><td>₹ %,.2f</td></tr>
                 <tr style="font-weight: bold; background: #fef2f2;">
                     <td>TOTAL DEDUCTIONS</td><td>₹ %,.2f</td>
                 </tr>
             </table>
         </div>

         <div class="total">
             <div style="display: flex; justify-content: space-between;">
                 <span>NET SETTLEMENT AMOUNT</span>
                 <span class="net">₹ %,.2f</span>
             </div>
         </div>

         <div class="footer">
             <p>Payment Mode: %s | Reference: %s</p>
             <p>This is a computer-generated document.</p>
         </div>
     </body>
     </html>
     """.formatted(
         s.getSettlementNumber(),
         emp.getFullName(), emp.getEmployeeId(),
         emp.getDesignation() != null ? emp.getDesignation() : "N/A",
         emp.getDateOfJoining(), s.getLastWorkingDate(),
         s.getStatus().name(),
         s.getPendingSalary(), s.getPendingBonus(),
         s.getLeaveEncashmentDays(), s.getLeaveEncashment(),
         s.getGratuity(), s.getOtherEarnings(),
         s.getTotalEarnings(),
         s.getTaxDeduction(), s.getPfDeduction(),
         s.getLoanRecovery(), s.getAdvanceRecovery(),
         s.getAssetRecovery(), s.getNoticePeriodRecovery(),
         s.getOtherDeductions(), s.getTotalDeductions(),
         s.getNetSettlement(),
         s.getPaymentMode() != null ? s.getPaymentMode().name() : "N/A",
         s.getPaymentReference() != null ? s.getPaymentReference() : "N/A"
     );
 }
}