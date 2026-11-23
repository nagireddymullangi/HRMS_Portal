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
import java.math.RoundingMode;
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

     // --- Earnings ---
     BigDecimal basic = request.getResolvedBasicSalary() != null ?
             request.getResolvedBasicSalary() : BigDecimal.valueOf(30000);
     BigDecimal hra = request.getHra() != null ?
             request.getHra() : basic.multiply(BigDecimal.valueOf(0.40)).setScale(2, RoundingMode.HALF_UP);
     BigDecimal transport = request.getTransportAllowance() != null ?
             request.getTransportAllowance() : basic.multiply(BigDecimal.valueOf(0.10)).setScale(2, RoundingMode.HALF_UP);
     BigDecimal medical = request.getMedicalAllowance() != null ?
             request.getMedicalAllowance() : basic.multiply(BigDecimal.valueOf(0.05)).setScale(2, RoundingMode.HALF_UP);
     BigDecimal others = request.getOtherAllowances() != null ?
             request.getOtherAllowances() : BigDecimal.ZERO;

     BigDecimal gross = basic.add(hra).add(transport).add(medical).add(others).setScale(2, RoundingMode.HALF_UP);

     // --- Employee Deductions ---
     // Employee PF (12% of basic)
     BigDecimal pfEmployee = request.getResolvedPfEmployee() != null ?
             request.getResolvedPfEmployee() :
             basic.multiply(BigDecimal.valueOf(0.12)).setScale(2, RoundingMode.HALF_UP);

     // Employee ESI (0.75% of gross if gross <= 21,000)
     BigDecimal esiEmployee = request.getResolvedEsiEmployee() != null ?
             request.getResolvedEsiEmployee() :
             (gross.compareTo(BigDecimal.valueOf(21000)) <= 0 ?
                     gross.multiply(BigDecimal.valueOf(0.0075)).setScale(2, RoundingMode.HALF_UP) : BigDecimal.ZERO);

     // Professional Tax (Standard 200 if gross > 15,000)
     BigDecimal professionalTax = request.getProfessionalTax() != null ?
             request.getProfessionalTax() :
             (gross.compareTo(BigDecimal.valueOf(15000)) > 0 ? BigDecimal.valueOf(200) : BigDecimal.ZERO);

     // Tax Deduction (TDS) (10% of gross if gross > 25,000)
     BigDecimal tax = request.getTaxDeduction() != null ?
             request.getTaxDeduction() :
             (gross.compareTo(BigDecimal.valueOf(25000)) > 0 ?
                     gross.multiply(BigDecimal.valueOf(0.10)).setScale(2, RoundingMode.HALF_UP) : BigDecimal.ZERO);

     BigDecimal otherDed = request.getOtherDeductions() != null ?
             request.getOtherDeductions() : BigDecimal.ZERO;

     BigDecimal totalDed = pfEmployee.add(esiEmployee).add(professionalTax).add(tax).add(otherDed).setScale(2, RoundingMode.HALF_UP);
     BigDecimal net = gross.subtract(totalDed).setScale(2, RoundingMode.HALF_UP);

     // --- Employer Contributions ---
     // Employer PF (12% of basic)
     BigDecimal pfEmployer = request.getPfEmployer() != null ?
             request.getPfEmployer() :
             basic.multiply(BigDecimal.valueOf(0.12)).setScale(2, RoundingMode.HALF_UP);

     // Employer ESI (3.25% of gross if gross <= 21,000)
     BigDecimal esiEmployer = request.getEsiEmployer() != null ?
             request.getEsiEmployer() :
             (gross.compareTo(BigDecimal.valueOf(21000)) <= 0 ?
                     gross.multiply(BigDecimal.valueOf(0.0325)).setScale(2, RoundingMode.HALF_UP) : BigDecimal.ZERO);

     BigDecimal totalEmployerContrib = pfEmployer.add(esiEmployer).setScale(2, RoundingMode.HALF_UP);
     BigDecimal ctc = gross.add(totalEmployerContrib).setScale(2, RoundingMode.HALF_UP);

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
             .pfDeduction(pfEmployee)
             .esiDeduction(esiEmployee)
             .professionalTax(professionalTax)
             .taxDeduction(tax)
             .otherDeductions(otherDed)
             .totalDeductions(totalDed)
             .netSalary(net)
             .pfEmployer(pfEmployer)
             .esiEmployer(esiEmployer)
             .totalEmployerContribution(totalEmployerContrib)
             .ctc(ctc)
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

     if (request.getResolvedBasicSalary() != null)
         payroll.setBasicSalary(request.getResolvedBasicSalary());
     if (request.getHra() != null) payroll.setHra(request.getHra());
     if (request.getTransportAllowance() != null)
         payroll.setTransportAllowance(request.getTransportAllowance());
     if (request.getMedicalAllowance() != null)
         payroll.setMedicalAllowance(request.getMedicalAllowance());
     if (request.getOtherAllowances() != null)
         payroll.setOtherAllowances(request.getOtherAllowances());

     if (request.getResolvedPfEmployee() != null)
         payroll.setPfDeduction(request.getResolvedPfEmployee());
     if (request.getResolvedEsiEmployee() != null)
         payroll.setEsiDeduction(request.getResolvedEsiEmployee());
     if (request.getProfessionalTax() != null)
         payroll.setProfessionalTax(request.getProfessionalTax());
     if (request.getTaxDeduction() != null)
         payroll.setTaxDeduction(request.getTaxDeduction());
     if (request.getOtherDeductions() != null)
         payroll.setOtherDeductions(request.getOtherDeductions());

     if (request.getPfEmployer() != null)
         payroll.setPfEmployer(request.getPfEmployer());
     if (request.getEsiEmployer() != null)
         payroll.setEsiEmployer(request.getEsiEmployer());

     BigDecimal gross = (payroll.getBasicSalary() != null ? payroll.getBasicSalary() : BigDecimal.ZERO)
             .add(payroll.getHra() != null ? payroll.getHra() : BigDecimal.ZERO)
             .add(payroll.getTransportAllowance() != null ? payroll.getTransportAllowance() : BigDecimal.ZERO)
             .add(payroll.getMedicalAllowance() != null ? payroll.getMedicalAllowance() : BigDecimal.ZERO)
             .add(payroll.getOtherAllowances() != null ? payroll.getOtherAllowances() : BigDecimal.ZERO)
             .setScale(2, RoundingMode.HALF_UP);

     BigDecimal totalDed = (payroll.getPfDeduction() != null ? payroll.getPfDeduction() : BigDecimal.ZERO)
             .add(payroll.getEsiDeduction() != null ? payroll.getEsiDeduction() : BigDecimal.ZERO)
             .add(payroll.getProfessionalTax() != null ? payroll.getProfessionalTax() : BigDecimal.ZERO)
             .add(payroll.getTaxDeduction() != null ? payroll.getTaxDeduction() : BigDecimal.ZERO)
             .add(payroll.getOtherDeductions() != null ? payroll.getOtherDeductions() : BigDecimal.ZERO)
             .setScale(2, RoundingMode.HALF_UP);

     BigDecimal totalEmployer = (payroll.getPfEmployer() != null ? payroll.getPfEmployer() : BigDecimal.ZERO)
             .add(payroll.getEsiEmployer() != null ? payroll.getEsiEmployer() : BigDecimal.ZERO)
             .setScale(2, RoundingMode.HALF_UP);

     payroll.setGrossSalary(gross);
     payroll.setTotalDeductions(totalDed);
     payroll.setNetSalary(gross.subtract(totalDed).setScale(2, RoundingMode.HALF_UP));
     payroll.setTotalEmployerContribution(totalEmployer);
     payroll.setCtc(gross.add(totalEmployer).setScale(2, RoundingMode.HALF_UP));

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

 public String buildPayslipHtml(Payroll payroll) {
   String htmlTemplate = """
       <!DOCTYPE html>
       <html>
       <head>
           <meta charset="UTF-8"/>
           <style>
               body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #1f2937; margin: 0; padding: 25px; line-height: 1.4; }
               .header { text-align: center; margin-bottom: 25px; border-bottom: 2px solid #2563eb; padding-bottom: 12px; }
               .title { font-size: 24px; font-weight: bold; color: #1e40af; margin: 0; letter-spacing: 1px; }
               .company-name { font-size: 15px; color: #4b5563; margin-top: 4px; font-weight: 600; }
               
               .emp-details { width: 100%%; margin-bottom: 20px; border-collapse: collapse; background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px; }
               .emp-details td { padding: 8px 12px; font-size: 13px; color: #4b5563; }
               .emp-details strong { color: #111827; }
               
               .salary-table { width: 100%%; border-collapse: collapse; margin-bottom: 20px; }
               .salary-table th, .salary-table td { border: 1px solid #d1d5db; padding: 9px 12px; text-align: left; font-size: 13px; }
               .salary-table th { background-color: #f3f4f6; color: #374151; font-weight: 600; }
               .salary-table .amount { text-align: right; font-family: monospace; font-size: 13px; }
               
               .section-title th { background-color: #e2e8f0; font-weight: bold; text-align: center; text-transform: uppercase; font-size: 12px; letter-spacing: 0.5px; color: #1e293b; }
               .totals th { background-color: #f8fafc; font-weight: bold; }
               .net-pay { font-size: 15px; font-weight: bold; background-color: #dbeafe !important; color: #1e40af !important; border-top: 2px solid #93c5fd !important; }
               
               .contrib-table { width: 100%%; border-collapse: collapse; margin-bottom: 20px; }
               .contrib-table th, .contrib-table td { border: 1px solid #d1d5db; padding: 8px 12px; text-align: left; font-size: 12px; }
               .contrib-table th { background-color: #f1f5f9; color: #334155; }
               .contrib-table .amount { text-align: right; font-family: monospace; }
               
               .summary-box { width: 100%%; border-collapse: collapse; margin-bottom: 20px; }
               .summary-box td { border: 1px solid #93c5fd; padding: 12px; text-align: center; background-color: #eff6ff; }
               .summary-box .highlight-val { font-size: 18px; font-weight: bold; color: #1e40af; margin-top: 4px; }
               .summary-box .label { font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 600; }
               
               .footer { text-align: center; font-size: 11px; color: #9ca3af; margin-top: 30px; border-top: 1px dashed #d1d5db; padding-top: 12px; }
           </style>
       </head>
       <body>
           <div class="header">
               <div class="title">SALARY PAYSLIP</div>
               <div class="company-name">POTLA TECH SOLUTIONS</div>
           </div>

           <table class="emp-details">
               <tr>
                   <td style="width: 50%%;"><strong>Employee Name:</strong> %s</td>
                   <td style="width: 50%%;"><strong>Employee Code:</strong> %s</td>
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
                   <td><strong>Payment Status:</strong> %s</td>
               </tr>
           </table>

           <table class="salary-table">
               <tr class="section-title">
                   <th colspan="2" style="width: 50%%;">Earnings (Allowances)</th>
                   <th colspan="2" style="width: 50%%;">Deductions (Employee)</th>
               </tr>
               
               <tr>
                   <td>Basic Pay</td>
                   <td class="amount">₹%s</td>
                   <td>Provident Fund (EPF - Employee)</td>
                   <td class="amount">₹%s</td>
               </tr>
               <tr>
                   <td>House Rent Allowance (HRA)</td>
                   <td class="amount">₹%s</td>
                   <td>Employee State Insurance (ESI)</td>
                   <td class="amount">₹%s</td>
               </tr>
               <tr>
                   <td>Transport Allowance (TA)</td>
                   <td class="amount">₹%s</td>
                   <td>Professional Tax (PT)</td>
                   <td class="amount">₹%s</td>
               </tr>
               <tr>
                   <td>Medical Allowance</td>
                   <td class="amount">₹%s</td>
                   <td>Tax Deducted at Source (TDS)</td>
                   <td class="amount">₹%s</td>
               </tr>
               <tr>
                   <td>Other Allowances</td>
                   <td class="amount">₹%s</td>
                   <td>Other Deductions / LOP</td>
                   <td class="amount">₹%s</td>
               </tr>
               
               <tr class="totals">
                   <th>Total Gross Earnings</th>
                   <th class="amount">₹%s</th>
                   <th>Total Deductions</th>
                   <th class="amount">₹%s</th>
               </tr>
           </table>

           <!-- Employer Contributions -->
           <table class="contrib-table">
               <tr class="section-title">
                   <th colspan="4">Employer Statutory Contributions</th>
               </tr>
               <tr>
                   <td style="width: 30%%;">Employer PF Contribution (12%%)</td>
                   <td class="amount" style="width: 20%%;">₹%s</td>
                   <td style="width: 30%%;">Employer ESI Contribution (3.25%%)</td>
                   <td class="amount" style="width: 20%%;">₹%s</td>
               </tr>
               <tr class="totals">
                   <th colspan="3" style="text-align: right;">Total Employer Statutory Contribution:</th>
                   <th class="amount">₹%s</th>
               </tr>
           </table>

           <!-- Net Summary -->
           <table class="summary-box">
               <tr>
                   <td style="width: 33%%;">
                       <div class="label">Gross Earnings</div>
                       <div class="highlight-val" style="color: #047857;">₹%s</div>
                   </td>
                   <td style="width: 34%%; background-color: #dbeafe; border: 2px solid #3b82f6;">
                       <div class="label" style="color: #1d4ed8; font-weight: bold;">Net Salary Payable</div>
                       <div class="highlight-val" style="color: #1e40af; font-size: 20px;">₹%s</div>
                   </td>
                   <td style="width: 33%%;">
                       <div class="label">Cost to Company (CTC)</div>
                       <div class="highlight-val" style="color: #4338ca;">₹%s</div>
                   </td>
               </tr>
           </table>

           <div class="footer">
               <p>This is a computer-generated payslip and does not require a physical signature.</p>
               <p>Generated on: %s</p>
           </div>
       </body>
       </html>
       """;

   String monthName = Month.of(payroll.getMonth())
           .getDisplayName(TextStyle.FULL, Locale.ENGLISH);

   String generatedDate = java.time.LocalDate.now().toString();

   return String.format(htmlTemplate,
           // Employee Details
           payroll.getEmployee().getFullName(),
           payroll.getEmployee().getEmployeeId(),
           payroll.getEmployee().getDesignation() != null ? payroll.getEmployee().getDesignation() : "N/A",
           payroll.getEmployee().getDepartment() != null ? payroll.getEmployee().getDepartment().getName() : "General",
           monthName,
           payroll.getYear(),
           payroll.getWorkingDays(),
           payroll.getPresentDays(),
           payroll.getStatus().name(),

           // Earnings & Deductions
           // Row 1: Basic & PF Employee
           formatCurrency(payroll.getBasicSalary()),
           formatCurrency(payroll.getPfDeduction()),

           // Row 2: HRA & ESI Employee
           formatCurrency(payroll.getHra()),
           formatCurrency(payroll.getEsiDeduction()),

           // Row 3: TA & PT
           formatCurrency(payroll.getTransportAllowance()),
           formatCurrency(payroll.getProfessionalTax()),

           // Row 4: Medical & TDS
           formatCurrency(payroll.getMedicalAllowance()),
           formatCurrency(payroll.getTaxDeduction()),

           // Row 5: Other Allowances & Other Deductions
           formatCurrency(payroll.getOtherAllowances()),
           formatCurrency(payroll.getOtherDeductions()),

           // Totals
           formatCurrency(payroll.getGrossSalary()),
           formatCurrency(payroll.getTotalDeductions()),

           // Employer Contributions
           formatCurrency(payroll.getPfEmployer()),
           formatCurrency(payroll.getEsiEmployer()),
           formatCurrency(payroll.getTotalEmployerContribution()),

           // Summary Box: Gross, Net Pay, CTC
           formatCurrency(payroll.getGrossSalary()),
           formatCurrency(payroll.getNetSalary()),
           formatCurrency(payroll.getCtc()),

           // Footer Date
           generatedDate
   );
 }

 private String formatCurrency(BigDecimal amount) {
   if (amount == null) {
       return "0.00";
   }
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
             .basicPay(p.getBasicSalary())
             .hra(p.getHra())
             .transportAllowance(p.getTransportAllowance())
             .medicalAllowance(p.getMedicalAllowance())
             .otherAllowances(p.getOtherAllowances())
             .grossSalary(p.getGrossSalary())
             .pfDeduction(p.getPfDeduction())
             .pfEmployee(p.getPfDeduction())
             .esiDeduction(p.getEsiDeduction())
             .esiEmployee(p.getEsiDeduction())
             .professionalTax(p.getProfessionalTax())
             .taxDeduction(p.getTaxDeduction())
             .otherDeductions(p.getOtherDeductions())
             .totalDeductions(p.getTotalDeductions())
             .netSalary(p.getNetSalary())
             .pfEmployer(p.getPfEmployer())
             .esiEmployer(p.getEsiEmployer())
             .totalEmployerContribution(p.getTotalEmployerContribution())
             .ctc(p.getCtc())
             .workingDays(p.getWorkingDays())
             .presentDays(p.getPresentDays())
             .status(p.getStatus().name())
             .generatedAt(p.getGeneratedAt())
             .paidAt(p.getPaidAt())
             .build();
 }
}
