
//service/ShiftService.java
package com.hrms.service;

import com.hrms.model.*;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

public interface ShiftService {
 Shift createShift(Shift shift);
 List<Shift> getAllShifts();
 Shift updateShift(Long id, Shift shift);
 void deleteShift(Long id);

 EmployeeShift assignShift(Long employeeId, Long shiftId, LocalDate from);
 List<EmployeeShift> getEmployeeShifts(Long employeeId);
 List<Map<String, Object>> getRoster();

 OvertimeRecord createOvertime(OvertimeRecord record);
 List<OvertimeRecord> getAllOvertime();
 OvertimeRecord approveOvertime(Long id, String status);
}
