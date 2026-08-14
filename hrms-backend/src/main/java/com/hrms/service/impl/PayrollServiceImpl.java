
//service/impl/PayrollServiceImpl.java
package com.hrms.service.impl;

import com.hrms.dto.request.PayrollRequest;
import com.hrms.dto.response.PayrollResponse;
import com.hrms.exception.HrmsAPIException;
import com.hrms.exception.ResourceNotFoundException;
import com.hrms.model.Employee;
import com.hrms.model.Payroll;
import com.hrms.repository.AttendanceRepository;
import com.hrms.repository.EmployeeRepository;
import com.hrms.repository.PayrollRepository;
import com.hrms.service.PayrollService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.Month;
import java.time.YearMonth;
import java.time.format.TextStyle;
import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;
import java.io.ByteArrayOutputStream;


@Service
@RequiredArgsConstructor
@Slf4j
public class PayrollServiceImpl implements PayrollService {

 private final PayrollRepository payrollRepository;
 private final EmployeeRepository employeeRepository;
 private final AttendanceRepository attendanceRepository;

 @Override
 @Transactional
 public PayrollResponse generatePayroll(PayrollRequest request) {
     if (payrollRepository.existsByEmployeeIdAndMonthAndYear(
             request.getEmployeeId(), request.getMonth(), request.getYear())) {
         throw new HrmsAPIException(HttpStatus.BAD_REQUEST,
                 "Payroll already generated for this month and year");
     }

     Employee employee = employeeRepository.findById(request.getEmployeeId())
             .orElseThrow(() -> new ResourceNotFoundException(
                     "Employee", "id", request.getEmployeeId()));

     // Calculate working & present days
     int workingDays = YearMonth.of(request.getYear(),
             request.getMonth()).lengthOfMonth();
     long presentDays = attendanceRepository
             .countByEmployeeAndStatusAndMonthAndYear(
                     request.getEmployeeId(),
                     com.hrms.model.Attendance.Status.PRESENT,
                     request.getMonth(), request.getYear());

     BigDecimal basic = request.getBasicSalary() != null ?
             request.getBasicSalary() : BigDecimal.valueOf(30000);
     BigDecimal hra = request.getHra() != null ?
             request.getHra() : basic.multiply(BigDecimal.valueOf(0.4));
     BigDecimal transport = request.getTransportAllowance() != null ?
             request.getTransportAllowance() : BigDecimal.valueOf(2000);
     BigDecimal medical = request.getMedicalAllowance() != null ?
             request.getMedicalAllowance() : BigDecimal.valueOf(1500);
     BigDecimal others = request.getOtherAllowances() != null ?
             request.getOtherAllowances() : BigDecimal.ZERO;

     BigDecimal gross = basic.add(hra).add(transport)
             .add(medical).add(others);

     BigDecimal pf = request.getPfDeduction() != null ?
             request.getPfDeduction() :
             basic.multiply(BigDecimal.valueOf(0.12));
     BigDecimal tax = request.getTaxDeduction() != null ?
             request.getTaxDeduction() :
             gross.multiply(BigDecimal.valueOf(0.1));
     BigDecimal otherDed = request.getOtherDeductions() != null ?
             request.getOtherDeductions() : BigDecimal.ZERO;

     BigDecimal totalDed = pf.add(tax).add(otherDed);
     BigDecimal net = gross.subtract(totalDed);

     Payroll payroll = Payroll.builder()
             .employee(employee)
             .month(request.getMonth())
             .year(request.getYear())
             .basicSalary(basic)
             .hra(hra)
             .transportAllowance(transport)
             .medicalAllowance(medical)
             .otherAllowances(others)
             .grossSalary(gross)
             .pfDeduction(pf)
             .taxDeduction(tax)
             .otherDeductions(otherDed)
             .totalDeductions(totalDed)
             .netSalary(net)
             .workingDays(workingDays)
             .presentDays((int) presentDays)
             .status(Payroll.Status.GENERATED)
             .build();

     return mapToResponse(payrollRepository.save(payroll));
 }

 @Override
 public PayrollResponse getPayrollById(Long id) {
     return mapToResponse(payrollRepository.findById(id)
             .orElseThrow(() -> new ResourceNotFoundException(
                     "Payroll", "id", id)));
 }

 @Override
 public List<PayrollResponse> getPayrollByEmployee(Long employeeId) {
     return payrollRepository
             .findByEmployeeIdOrderByYearDescMonthDesc(employeeId)
             .stream().map(this::mapToResponse).collect(Collectors.toList());
 }

 @Override
 public List<PayrollResponse> getAllPayroll() {
     return payrollRepository.findAllByOrderByYearDescMonthDesc()
             .stream().map(this::mapToResponse).collect(Collectors.toList());
 }

 @Override
 public List<PayrollResponse> getPayrollByMonthAndYear(int month, int year) {
     return payrollRepository.findByMonthAndYearOrderByEmployeeFirstNameAsc(
             month, year)
             .stream().map(this::mapToResponse).collect(Collectors.toList());
 }

 @Override
 @Transactional
 public PayrollResponse updatePayroll(Long id, PayrollRequest request) {
     Payroll payroll = payrollRepository.findById(id)
             .orElseThrow(() -> new ResourceNotFoundException(
                     "Payroll", "id", id));

     if (request.getBasicSalary() != null)
         payroll.setBasicSalary(request.getBasicSalary());
     if (request.getHra() != null) payroll.setHra(request.getHra());
     if (request.getTransportAllowance() != null)
         payroll.setTransportAllowance(request.getTransportAllowance());
     if (request.getMedicalAllowance() != null)
         payroll.setMedicalAllowance(request.getMedicalAllowance());
     if (request.getOtherAllowances() != null)
         payroll.setOtherAllowances(request.getOtherAllowances());
     if (request.getPfDeduction() != null)
         payroll.setPfDeduction(request.getPfDeduction());
     if (request.getTaxDeduction() != null)
         payroll.setTaxDeduction(request.getTaxDeduction());
     if (request.getOtherDeductions() != null)
         payroll.setOtherDeductions(request.getOtherDeductions());

     BigDecimal gross = payroll.getBasicSalary()
             .add(payroll.getHra())
             .add(payroll.getTransportAllowance())
             .add(payroll.getMedicalAllowance())
             .add(payroll.getOtherAllowances());
     BigDecimal totalDed = payroll.getPfDeduction()
             .add(payroll.getTaxDeduction())
             .add(payroll.getOtherDeductions());

     payroll.setGrossSalary(gross);
     payroll.setTotalDeductions(totalDed);
     payroll.setNetSalary(gross.subtract(totalDed));

     return mapToResponse(payrollRepository.save(payroll));
 }

 @Override
 public byte[] downloadPayslipPdf(Long id) {
	 Payroll payroll = payrollRepository.findById(id)
			 .orElseThrow(() -> new ResourceNotFoundException(
					 "Payroll", "id", id));
	 return generatePdf(payroll);
 }
 
 private byte[] generatePdf(Payroll payroll) {
	 try {
		 String htmlContent = buildPayslipHtml(payroll);
		 ByteArrayOutputStream baos = new ByteArrayOutputStream();
		 com.itextpdf.html2pdf.HtmlConverter.convertToPdf(htmlContent, baos);
		 return baos.toByteArray();
	 } catch (Exception e) {
		 log.error("Error generating PDF: ", e);
		 throw new RuntimeException("Failed to generate PDF");
	 }
 }
 
//... inside your PayrollServiceImpl class ...

public String buildPayslipHtml(Payroll payroll) {
  // Using Java 17 Text Blocks for clean HTML formatting
  String htmlTemplate = """
      <!DOCTYPE html>
      <html>
      <head>
          <style>
              body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #333; margin: 0; padding: 20px; }
              .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #2563eb; padding-bottom: 15px; }
              .title { font-size: 26px; font-weight: bold; color: #1e40af; margin: 0; letter-spacing: 1px; }
              .company-name { font-size: 16px; color: #6b7280; margin-top: 5px; }
              
              .emp-details { width: 100%%; margin-bottom: 30px; border-collapse: collapse; }
              .emp-details td { padding: 8px; font-size: 14px; color: #4b5563; }
              .emp-details strong { color: #111827; }
              
              .salary-table { width: 100%%; border-collapse: collapse; margin-bottom: 30px; }
              .salary-table th, .salary-table td { border: 1px solid #d1d5db; padding: 12px; text-align: left; font-size: 14px; }
              .salary-table th { background-color: #f3f4f6; color: #374151; }
              .salary-table .amount { text-align: right; font-family: monospace; font-size: 15px; }
              
              .section-title th { background-color: #e5e7eb; font-weight: bold; text-align: center; text-transform: uppercase; font-size: 13px; letter-spacing: 0.5px;}
              .totals th { background-color: #f9fafb; font-weight: bold; }
              .net-pay { font-size: 16px; font-weight: bold; background-color: #dbeafe !important; color: #1e40af !important; border-top: 2px solid #93c5fd !important; }
              
              .footer { text-align: center; font-size: 12px; color: #9ca3af; margin-top: 40px; border-top: 1px dashed #d1d5db; padding-top: 15px; }
          </style>
      </head>
      <body>
          <div class="header">
              <div class="title">SALARY PAYSLIP</div>
              <div class="company-name">POTLA TECH SOLUTIONS</div>
          </div>

          <table class="emp-details">
              <tr>
                  <td><strong>Employee Name:</strong> %s</td>
                  <td><strong>Employee Code:</strong> %s</td>
              </tr>
              <tr>
                  <td><strong>Designation:</strong> %s</td>
                  <td><strong>Department:</strong> %s</td>
              </tr>
              <tr>
                  <td><strong>Pay Period:</strong> %s %d</td>
                  <td><strong>Working Days:</strong> %s</td>
              </tr>
              <tr>
				  <td><strong>Present Days:</strong> %s</td>
				  <td></td>
          </table>

          <table class="salary-table">
              <tr class="section-title">
                  <th colspan="2">Earnings</th>
                  <th colspan="2">Deductions</th>
              </tr>
              
              <tr>
                  <td>Basic Salary</td>
                  <td class="amount">₹%s</td>
                  <td>Provident Fund (PF)</td>
                  <td class="amount">₹%s</td>
              </tr>
              <tr>
                  <td>House Rent Allowance (HRA)</td>
                  <td class="amount">₹%s</td>
                  <td>Tax Deduction (TDS)</td>
                  <td class="amount">₹%s</td>
              </tr>
              <tr>
                  <td>Transport Allowance</td>
                  <td class="amount">₹%s</td>
                  <td>Other Deductions</td>
                  <td class="amount">₹%s</td>
              </tr>
              <tr>
                  <td>Medical Allowance</td>
                  <td class="amount">₹%s</td>
                  <td></td>
                  <td class="amount"></td>
              </tr>
              <tr>
                  <td>Other Allowances</td>
                  <td class="amount">₹%s</td>
                  <td></td>
                  <td class="amount"></td>
              </tr>
              
              <tr class="totals">
                  <th>Gross Earnings</th>
                  <th class="amount">₹%s</th>
                  <th>Total Deductions</th>
                  <th class="amount">₹%s</th>
              </tr>
              
              <tr>
                  <td colspan="2" class="net-pay">Net Salary Payable</td>
                  <td colspan="2" class="net-pay amount">₹%s</td>
              </tr>
          </table>

          <div class="footer">
              <p>This is a computer-generated payslip and does not require a physical signature.</p>
              <p>Generated on: %s</p>
          </div>
      </body>
      </html>
      """;

  // Format the month nicely (e.g., "7" becomes "July")
  String monthName = Month.of(payroll.getMonth())
          .getDisplayName(TextStyle.FULL, Locale.ENGLISH);
          
  // Current date for the footer
  String generatedDate = java.time.LocalDate.now().toString();

  // Map the fields exactly to the %s placeholders in the HTML string
  return String.format(htmlTemplate,
          // Employee Details
          payroll.getEmployee().getFullName(),
          payroll.getEmployee().getEmployeeId(), // Or getEmployeeCode() based on your entity
          payroll.getEmployee().getDesignation(),
          payroll.getEmployee().getDepartment().getName(),
          monthName, 
          payroll.getYear(),
          payroll.getWorkingDays(),
          payroll.getPresentDays(),
          
          // Row 1: Basic & PF
          formatCurrency(payroll.getBasicSalary()),
          formatCurrency(payroll.getPfDeduction()),

          // Row 2: HRA & Tax
          formatCurrency(payroll.getHra()),
          formatCurrency(payroll.getTaxDeduction()),

          // Row 3: Transport & Other Deductions
          formatCurrency(payroll.getTransportAllowance()),
          formatCurrency(payroll.getOtherDeductions()),

          // Row 4: Medical
          formatCurrency(payroll.getMedicalAllowance()),

          // Row 5: Other Allowances
          formatCurrency(payroll.getOtherAllowances()),

          // Totals Row
          formatCurrency(payroll.getGrossSalary()),
          formatCurrency(payroll.getTotalDeductions()),

          // Net Salary
          formatCurrency(payroll.getNetSalary()),
          
          // Footer Date
          generatedDate
  );
}

/**
* Helper method to safely format BigDecimal to a standard 2-decimal currency string
*/
private String formatCurrency(BigDecimal amount) {
  if (amount == null) {
      return "0.00";
  }
  // Formats to 2 decimal places (e.g., 45000 -> 45000.00)
  return String.format("%.2f", amount);
}
 
 @Override
 @Transactional
 public PayrollResponse markAsPaid(Long id) {
     Payroll payroll = payrollRepository.findById(id)
             .orElseThrow(() -> new ResourceNotFoundException(
                     "Payroll", "id", id));
     payroll.setStatus(Payroll.Status.PAID);
     payroll.setPaidAt(LocalDateTime.now());
     return mapToResponse(payrollRepository.save(payroll));
 }

 @Override
 @Transactional
 public void deletePayroll(Long id) {
     payrollRepository.findById(id)
             .orElseThrow(() -> new ResourceNotFoundException(
                     "Payroll", "id", id));
     payrollRepository.deleteById(id);
 }

 private PayrollResponse mapToResponse(Payroll p) {
     return PayrollResponse.builder()
             .id(p.getId())
             .employeeId(p.getEmployee().getId())
             .employeeName(p.getEmployee().getFullName())
             .employeeCode(p.getEmployee().getEmployeeId())
             .departmentName(p.getEmployee().getDepartment() != null ?
                     p.getEmployee().getDepartment().getName() : null)
             .designation(p.getEmployee().getDesignation())
             .month(p.getMonth())
             .year(p.getYear())
             .basicSalary(p.getBasicSalary())
             .hra(p.getHra())
             .transportAllowance(p.getTransportAllowance())
             .medicalAllowance(p.getMedicalAllowance())
             .otherAllowances(p.getOtherAllowances())
             .grossSalary(p.getGrossSalary())
             .pfDeduction(p.getPfDeduction())
             .taxDeduction(p.getTaxDeduction())
             .otherDeductions(p.getOtherDeductions())
             .totalDeductions(p.getTotalDeductions())
             .netSalary(p.getNetSalary())
             .workingDays(p.getWorkingDays())
             .presentDays(p.getPresentDays())
             .status(p.getStatus().name())
             .generatedAt(p.getGeneratedAt())
             .paidAt(p.getPaidAt())
             .build();
 }
}