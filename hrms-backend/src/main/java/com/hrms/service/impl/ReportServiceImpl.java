
//service/impl/ReportServiceImpl.java
package com.hrms.service.impl;

import com.hrms.model.*;
import com.hrms.repository.*;
import com.hrms.service.ReportService;
import com.opencsv.CSVWriter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.OutputStreamWriter;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReportServiceImpl implements ReportService {

 private final EmployeeRepository employeeRepository;
 private final AttendanceRepository attendanceRepository;
 private final PayrollRepository payrollRepository;
 private final LeaveRepository leaveRepository;

 private static final DateTimeFormatter DATE_FMT =
     DateTimeFormatter.ofPattern("dd-MM-yyyy");

 @Override
 public byte[] exportEmployeesExcel() {
     try (Workbook workbook = new XSSFWorkbook();
          ByteArrayOutputStream out = new ByteArrayOutputStream()) {

         Sheet sheet = workbook.createSheet("Employees");
         CellStyle headerStyle = createHeaderStyle(workbook);

         // Headers
         String[] headers = {"Emp ID", "Name", "Email", "Phone",
                             "Department", "Designation", "Joining Date",
                             "Status"};

         Row header = sheet.createRow(0);
         for (int i = 0; i < headers.length; i++) {
             Cell cell = header.createCell(i);
             cell.setCellValue(headers[i]);
             cell.setCellStyle(headerStyle);
         }

         // Data
         List<Employee> employees = employeeRepository.findAll();
         int rowIdx = 1;

         for (Employee emp : employees) {
             Row row = sheet.createRow(rowIdx++);
             row.createCell(0).setCellValue(emp.getEmployeeId());
             row.createCell(1).setCellValue(emp.getFullName());
             row.createCell(2).setCellValue(emp.getEmail());
             row.createCell(3).setCellValue(
                 emp.getPhone() != null ? emp.getPhone() : "");
             row.createCell(4).setCellValue(
                 emp.getDepartment() != null ?
                     emp.getDepartment().getName() : "");
             row.createCell(5).setCellValue(
                 emp.getDesignation() != null ? emp.getDesignation() : "");
             row.createCell(6).setCellValue(
                 emp.getDateOfJoining() != null ?
                     emp.getDateOfJoining().format(DATE_FMT) : "");
             row.createCell(7).setCellValue(emp.getStatus().name());
         }

         // Auto-size columns
         for (int i = 0; i < headers.length; i++) {
             sheet.autoSizeColumn(i);
         }

         workbook.write(out);
         return out.toByteArray();
     } catch (Exception e) {
         log.error("Error generating Excel", e);
         throw new RuntimeException("Failed to generate Excel");
     }
 }

 @Override
 public byte[] exportEmployeesCsv() {
     try (ByteArrayOutputStream out = new ByteArrayOutputStream();
          OutputStreamWriter osw = new OutputStreamWriter(out);
          CSVWriter writer = new CSVWriter(osw)) {

         // Header
         writer.writeNext(new String[]{
             "Employee ID", "Name", "Email", "Phone",
             "Department", "Designation", "Joining Date", "Status"
         });

         // Data
         employeeRepository.findAll().forEach(emp -> {
             writer.writeNext(new String[]{
                 emp.getEmployeeId(),
                 emp.getFullName(),
                 emp.getEmail(),
                 emp.getPhone() != null ? emp.getPhone() : "",
                 emp.getDepartment() != null ?
                     emp.getDepartment().getName() : "",
                 emp.getDesignation() != null ? emp.getDesignation() : "",
                 emp.getDateOfJoining() != null ?
                     emp.getDateOfJoining().format(DATE_FMT) : "",
                 emp.getStatus().name()
             });
         });

         writer.flush();
         return out.toByteArray();
     } catch (Exception e) {
         log.error("Error generating CSV", e);
         throw new RuntimeException("Failed to generate CSV");
     }
 }

 @Override
 public byte[] exportAttendanceExcel(LocalDate startDate, LocalDate endDate) {
     try (Workbook workbook = new XSSFWorkbook();
          ByteArrayOutputStream out = new ByteArrayOutputStream()) {

         Sheet sheet = workbook.createSheet("Attendance");
         CellStyle headerStyle = createHeaderStyle(workbook);

         String[] headers = {"Employee", "Emp ID", "Date", "Check In",
                             "Check Out", "Hours", "Status"};

         Row header = sheet.createRow(0);
         for (int i = 0; i < headers.length; i++) {
             Cell cell = header.createCell(i);
             cell.setCellValue(headers[i]);
             cell.setCellStyle(headerStyle);
         }

         List<Attendance> records = attendanceRepository
             .findByDateBetweenOrderByDateDesc(startDate, endDate);

         int rowIdx = 1;
         for (Attendance a : records) {
             Row row = sheet.createRow(rowIdx++);
             row.createCell(0).setCellValue(a.getEmployee().getFullName());
             row.createCell(1).setCellValue(a.getEmployee().getEmployeeId());
             row.createCell(2).setCellValue(a.getDate().format(DATE_FMT));
             row.createCell(3).setCellValue(
                 a.getCheckIn() != null ? a.getCheckIn().toString() : "");
             row.createCell(4).setCellValue(
                 a.getCheckOut() != null ? a.getCheckOut().toString() : "");
             row.createCell(5).setCellValue(
                 a.getWorkingHours() != null ? a.getWorkingHours() : 0);
             row.createCell(6).setCellValue(a.getStatus().name());
         }

         for (int i = 0; i < headers.length; i++) {
             sheet.autoSizeColumn(i);
         }

         workbook.write(out);
         return out.toByteArray();
     } catch (Exception e) {
         log.error("Error generating attendance Excel", e);
         throw new RuntimeException("Failed to generate Excel");
     }
 }

 @Override
 public byte[] exportPayrollExcel(int month, int year) {
     try (Workbook workbook = new XSSFWorkbook();
          ByteArrayOutputStream out = new ByteArrayOutputStream()) {

         Sheet sheet = workbook.createSheet("Payroll_" + month + "_" + year);
         CellStyle headerStyle = createHeaderStyle(workbook);

         String[] headers = {"Emp ID", "Name", "Department", "Basic",
                             "HRA", "Allowances", "Gross", "PF", "Tax",
                             "Deductions", "Net Salary", "Status"};

         Row header = sheet.createRow(0);
         for (int i = 0; i < headers.length; i++) {
             Cell cell = header.createCell(i);
             cell.setCellValue(headers[i]);
             cell.setCellStyle(headerStyle);
         }

         List<Payroll> payrolls = payrollRepository
             .findByMonthAndYearOrderByEmployeeFirstNameAsc(month, year);

         int rowIdx = 1;
         for (Payroll p : payrolls) {
             Row row = sheet.createRow(rowIdx++);
             Employee emp = p.getEmployee();
             row.createCell(0).setCellValue(emp.getEmployeeId());
             row.createCell(1).setCellValue(emp.getFullName());
             row.createCell(2).setCellValue(emp.getDepartment() != null ?
                 emp.getDepartment().getName() : "");
             row.createCell(3).setCellValue(p.getBasicSalary().doubleValue());
             row.createCell(4).setCellValue(p.getHra().doubleValue());
             row.createCell(5).setCellValue(
                 p.getTransportAllowance().doubleValue() +
                 p.getMedicalAllowance().doubleValue() +
                 p.getOtherAllowances().doubleValue());
             row.createCell(6).setCellValue(p.getGrossSalary().doubleValue());
             row.createCell(7).setCellValue(p.getPfDeduction().doubleValue());
             row.createCell(8).setCellValue(p.getTaxDeduction().doubleValue());
             row.createCell(9).setCellValue(
                 p.getTotalDeductions().doubleValue());
             row.createCell(10).setCellValue(p.getNetSalary().doubleValue());
             row.createCell(11).setCellValue(p.getStatus().name());
         }

         // Add totals row
         Row totalRow = sheet.createRow(rowIdx);
         CellStyle boldStyle = workbook.createCellStyle();
         Font boldFont = workbook.createFont();
         boldFont.setBold(true);
         boldStyle.setFont(boldFont);

         Cell totalLabel = totalRow.createCell(0);
         totalLabel.setCellValue("TOTAL");
         totalLabel.setCellStyle(boldStyle);

         Cell netTotal = totalRow.createCell(10);
         netTotal.setCellFormula("SUM(K2:K" + rowIdx + ")");
         netTotal.setCellStyle(boldStyle);

         for (int i = 0; i < headers.length; i++) {
             sheet.autoSizeColumn(i);
         }

         workbook.write(out);
         return out.toByteArray();
     } catch (Exception e) {
         log.error("Error generating payroll Excel", e);
         throw new RuntimeException("Failed to generate Excel");
     }
 }

 @Override
 public byte[] exportLeavesExcel(String status) {
     try (Workbook workbook = new XSSFWorkbook();
          ByteArrayOutputStream out = new ByteArrayOutputStream()) {

         Sheet sheet = workbook.createSheet("Leaves");
         CellStyle headerStyle = createHeaderStyle(workbook);

         String[] headers = {"Employee", "Type", "From", "To", "Days",
                             "Reason", "Status", "Comment"};

         Row header = sheet.createRow(0);
         for (int i = 0; i < headers.length; i++) {
             Cell cell = header.createCell(i);
             cell.setCellValue(headers[i]);
             cell.setCellStyle(headerStyle);
         }

         List<Leave> leaves;
         if (status != null && !status.equalsIgnoreCase("ALL")) {
             leaves = leaveRepository.findByStatusOrderByAppliedAtDesc(
                 Leave.Status.valueOf(status));
         } else {
             leaves = leaveRepository.findAllByOrderByAppliedAtDesc();
         }

         int rowIdx = 1;
         for (Leave l : leaves) {
             Row row = sheet.createRow(rowIdx++);
             row.createCell(0).setCellValue(l.getEmployee().getFullName());
             row.createCell(1).setCellValue(l.getLeaveType().getName());
             row.createCell(2).setCellValue(l.getStartDate().format(DATE_FMT));
             row.createCell(3).setCellValue(l.getEndDate().format(DATE_FMT));
             row.createCell(4).setCellValue(l.getTotalDays());
             row.createCell(5).setCellValue(
                 l.getReason() != null ? l.getReason() : "");
             row.createCell(6).setCellValue(l.getStatus().name());
             row.createCell(7).setCellValue(
                 l.getAdminComment() != null ? l.getAdminComment() : "");
         }

         for (int i = 0; i < headers.length; i++) {
             sheet.autoSizeColumn(i);
         }

         workbook.write(out);
         return out.toByteArray();
     } catch (Exception e) {
         log.error("Error generating leaves Excel", e);
         throw new RuntimeException("Failed to generate Excel");
     }
 }

 @Override
 public byte[] generateMonthlyHRReport(int month, int year) {
     try (Workbook workbook = new XSSFWorkbook();
          ByteArrayOutputStream out = new ByteArrayOutputStream()) {

         CellStyle headerStyle = createHeaderStyle(workbook);
         CellStyle boldStyle = workbook.createCellStyle();
         Font boldFont = workbook.createFont();
         boldFont.setBold(true);
         boldStyle.setFont(boldFont);

         // Sheet 1: Summary
         Sheet summary = workbook.createSheet("Summary");
         Row title = summary.createRow(0);
         Cell titleCell = title.createCell(0);
         titleCell.setCellValue("Monthly HR Report - " + month + "/" + year);
         titleCell.setCellStyle(boldStyle);

         Row headerRow = summary.createRow(2);
         headerRow.createCell(0).setCellValue("Metric");
         headerRow.createCell(1).setCellValue("Value");
         headerRow.getCell(0).setCellStyle(headerStyle);
         headerRow.getCell(1).setCellStyle(headerStyle);

         long totalEmployees = employeeRepository.count();
         long activeEmployees = employeeRepository.countActiveEmployees();
         long totalPayrolls = payrollRepository
             .findByMonthAndYearOrderByEmployeeFirstNameAsc(month, year)
             .size();

         String[][] data = {
             {"Total Employees", String.valueOf(totalEmployees)},
             {"Active Employees", String.valueOf(activeEmployees)},
             {"Inactive Employees",
              String.valueOf(totalEmployees - activeEmployees)},
             {"Payrolls Processed", String.valueOf(totalPayrolls)},
         };

         for (int i = 0; i < data.length; i++) {
             Row row = summary.createRow(3 + i);
             row.createCell(0).setCellValue(data[i][0]);
             row.createCell(1).setCellValue(data[i][1]);
         }

         summary.autoSizeColumn(0);
         summary.autoSizeColumn(1);

         workbook.write(out);
         return out.toByteArray();
     } catch (Exception e) {
         log.error("Error generating HR report", e);
         throw new RuntimeException("Failed to generate report");
     }
 }

 private CellStyle createHeaderStyle(Workbook workbook) {
     CellStyle style = workbook.createCellStyle();
     Font font = workbook.createFont();
     font.setBold(true);
     font.setColor(IndexedColors.WHITE.getIndex());
     style.setFont(font);
     style.setFillForegroundColor(IndexedColors.BLUE_GREY.getIndex());
     style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
     style.setAlignment(HorizontalAlignment.CENTER);
     return style;
 }
}