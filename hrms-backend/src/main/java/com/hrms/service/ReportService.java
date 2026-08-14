
//service/ReportService.java
package com.hrms.service;

import java.time.LocalDate;

public interface ReportService {

 byte[] exportEmployeesExcel();

 byte[] exportEmployeesCsv();

 byte[] exportAttendanceExcel(LocalDate startDate, LocalDate endDate);

 byte[] exportPayrollExcel(int month, int year);

 byte[] exportLeavesExcel(String status);

 byte[] generateMonthlyHRReport(int month, int year);
}