
//controller/PayrollController.java
package com.hrms.controller;

import com.hrms.dto.request.PayrollRequest;
import com.hrms.dto.response.ApiResponse;
import com.hrms.dto.response.PayrollResponse;
import com.hrms.service.PayrollService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/payroll")
@RequiredArgsConstructor
public class PayrollController {

 private final PayrollService payrollService;

 @PostMapping("/generate")
 @PreAuthorize("hasRole('ADMIN')")
 public ResponseEntity<ApiResponse<PayrollResponse>> generate(
         @Valid @RequestBody PayrollRequest request) {
     return new ResponseEntity<>(
             ApiResponse.success("Payroll generated successfully",
                     payrollService.generatePayroll(request)),
             HttpStatus.CREATED);
 }

 @GetMapping("/{id}")
 @PreAuthorize("hasAnyRole('ADMIN','EMPLOYEE')")
 public ResponseEntity<ApiResponse<PayrollResponse>> getById(
         @PathVariable Long id) {
     return ResponseEntity.ok(
             ApiResponse.success("Success", payrollService.getPayrollById(id)));
 }

 @GetMapping("/employee/{employeeId}")
 @PreAuthorize("hasAnyRole('ADMIN','EMPLOYEE')")
 public ResponseEntity<ApiResponse<List<PayrollResponse>>> getByEmployee(
         @PathVariable Long employeeId) {
     return ResponseEntity.ok(
             ApiResponse.success("Success",
                     payrollService.getPayrollByEmployee(employeeId)));
 }

 @GetMapping("/all")
 @PreAuthorize("hasRole('ADMIN')")
 public ResponseEntity<ApiResponse<List<PayrollResponse>>> getAll() {
     return ResponseEntity.ok(
             ApiResponse.success("Success", payrollService.getAllPayroll()));
 }

 @GetMapping("/month")
 @PreAuthorize("hasRole('ADMIN')")
 public ResponseEntity<ApiResponse<List<PayrollResponse>>> getByMonthYear(
         @RequestParam int month, @RequestParam int year) {
     return ResponseEntity.ok(
             ApiResponse.success("Success",
                     payrollService.getPayrollByMonthAndYear(month, year)));
 }

 @PutMapping("/{id}")
 @PreAuthorize("hasRole('ADMIN')")
 public ResponseEntity<ApiResponse<PayrollResponse>> update(
         @PathVariable Long id,
         @RequestBody PayrollRequest request) {
     return ResponseEntity.ok(
             ApiResponse.success("Payroll updated successfully",
                     payrollService.updatePayroll(id, request)));
 }

 @PatchMapping("/{id}/mark-paid")
 @PreAuthorize("hasRole('ADMIN')")
 public ResponseEntity<ApiResponse<PayrollResponse>> markPaid(
         @PathVariable Long id) {
     return ResponseEntity.ok(
             ApiResponse.success("Payroll marked as paid",
                     payrollService.markAsPaid(id)));
 }

 @DeleteMapping("/{id}")
 @PreAuthorize("hasRole('ADMIN')")
 public ResponseEntity<ApiResponse<String>> delete(@PathVariable Long id) {
     payrollService.deletePayroll(id);
     return ResponseEntity.ok(
             ApiResponse.success("Payroll deleted successfully"));
 }
 
 @GetMapping("/{id}/download")
 @PreAuthorize("hasAnyRole('ADMIN','EMPLOYEE')")
 public ResponseEntity<byte[]> downloadPayslip(@PathVariable Long id) {
	 	 byte[] pdfBytes = payrollService.downloadPayslipPdf(id);
	 return ResponseEntity.ok()
			 .header("Content-Disposition", "attachment; filename=payslip_" + id + ".pdf")
			 .contentType(org.springframework.http.MediaType.APPLICATION_PDF)
			 .body(pdfBytes);	
 }
}