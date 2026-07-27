
//service/AttendanceService.java
package com.hrms.service;

import com.hrms.dto.request.AttendanceRequest;
import com.hrms.dto.response.AttendanceResponse;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

public interface AttendanceService {
 AttendanceResponse markAttendance(AttendanceRequest request);
 AttendanceResponse updateAttendance(Long id, AttendanceRequest request);
 AttendanceResponse getAttendanceById(Long id);
 List<AttendanceResponse> getAttendanceByEmployee(Long employeeId);
 List<AttendanceResponse> getAttendanceByEmployeeAndDateRange(
     Long employeeId, LocalDate start, LocalDate end);
 List<AttendanceResponse> getAllAttendanceByDate(LocalDate date);
 List<AttendanceResponse> getAllAttendance();
 Map<String, Long> getAttendanceSummary(Long employeeId, int month, int year);
 void deleteAttendance(Long id);
}