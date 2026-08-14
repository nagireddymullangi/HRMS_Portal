
//controller/ReportController.java
package com.hrms.controller;

import com.hrms.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class ReportController {

 private final ReportService reportService;

 @GetMapping("/employees/excel")
 public ResponseEntity<ByteArrayResource> exportEmployeesExcel() {
     byte[] data = reportService.exportEmployeesExcel();
     return buildResponse(data, "employees.xlsx",
         "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
 }

 @GetMapping("/employees/csv")
 public ResponseEntity<ByteArrayResource> exportEmployeesCsv() {
     byte[] data = reportService.exportEmployeesCsv();
     return buildResponse(data, "employees.csv", "text/csv");
 }

 @GetMapping("/attendance/excel")
 public ResponseEntity<ByteArrayResource> exportAttendanceExcel(
         @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
         LocalDate startDate,
         @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
         LocalDate endDate) {

     byte[] data = reportService.exportAttendanceExcel(startDate, endDate);
     return buildResponse(data,
         "attendance_" + startDate + "_to_" + endDate + ".xlsx",
         "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
 }

 @GetMapping("/payroll/excel")
 public ResponseEntity<ByteArrayResource> exportPayrollExcel(
         @RequestParam int month, @RequestParam int year) {
     byte[] data = reportService.exportPayrollExcel(month, year);
     return buildResponse(data,
         "payroll_" + month + "_" + year + ".xlsx",
         "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
 }

 @GetMapping("/leaves/excel")
 public ResponseEntity<ByteArrayResource> exportLeavesExcel(
         @RequestParam(required = false, defaultValue = "ALL")
         String status) {
     byte[] data = reportService.exportLeavesExcel(status);
     return buildResponse(data, "leaves.xlsx",
         "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
 }

 @GetMapping("/hr-report")
 public ResponseEntity<ByteArrayResource> generateHRReport(
         @RequestParam int month, @RequestParam int year) {
     byte[] data = reportService.generateMonthlyHRReport(month, year);
     return buildResponse(data,
         "hr_report_" + month + "_" + year + ".xlsx",
         "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
 }

 private ResponseEntity<ByteArrayResource> buildResponse(
         byte[] data, String filename, String contentType) {
     return ResponseEntity.ok()
             .contentType(MediaType.parseMediaType(contentType))
             .header(HttpHeaders.CONTENT_DISPOSITION,
                     "attachment; filename=\"" + filename + "\"")
             .contentLength(data.length)
             .body(new ByteArrayResource(data));
 }
}