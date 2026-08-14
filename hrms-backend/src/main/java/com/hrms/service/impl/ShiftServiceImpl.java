
//service/impl/ShiftServiceImpl.java
package com.hrms.service.impl;

import com.hrms.exception.ResourceNotFoundException;
import com.hrms.model.*;
import com.hrms.repository.*;
import com.hrms.service.ShiftService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ShiftServiceImpl implements ShiftService {

 private final ShiftRepository shiftRepository;
 private final EmployeeShiftRepository employeeShiftRepository;
 private final EmployeeRepository employeeRepository;
 private final OvertimeRecordRepository overtimeRepository;

 @Override
 public Shift createShift(Shift shift) {
     shift.setWorkingHours(calculateWorkingHours(shift));
     return shiftRepository.save(shift);
 }

 @Override
 public List<Shift> getAllShifts() {
     return shiftRepository.findAll();
 }

 @Override
 public Shift updateShift(Long id, Shift shift) {
     Shift existing = shiftRepository.findById(id)
             .orElseThrow(() -> new ResourceNotFoundException("Shift", "id", id));
     existing.setName(shift.getName());
     existing.setStartTime(shift.getStartTime());
     existing.setEndTime(shift.getEndTime());
     existing.setBreakMinutes(shift.getBreakMinutes());
     existing.setIsNightShift(shift.getIsNightShift());
     existing.setIsActive(shift.getIsActive());
     existing.setWorkingHours(calculateWorkingHours(existing));
     return shiftRepository.save(existing);
 }

 @Override
 public void deleteShift(Long id) {
     shiftRepository.deleteById(id);
 }

 @Override
 @Transactional
 public EmployeeShift assignShift(Long employeeId, Long shiftId,
                                   LocalDate from) {
     Employee emp = employeeRepository.findById(employeeId)
             .orElseThrow(() -> new ResourceNotFoundException(
                 "Employee", "id", employeeId));
     Shift shift = shiftRepository.findById(shiftId)
             .orElseThrow(() -> new ResourceNotFoundException(
                 "Shift", "id", shiftId));

     // Deactivate previous
     employeeShiftRepository.findByEmployeeIdAndIsActiveTrue(employeeId)
             .ifPresent(prev -> {
                 prev.setIsActive(false);
                 prev.setEffectiveTo(from.minusDays(1));
                 employeeShiftRepository.save(prev);
             });

     EmployeeShift assignment = EmployeeShift.builder()
             .employee(emp)
             .shift(shift)
             .effectiveFrom(from)
             .isActive(true)
             .build();

     return employeeShiftRepository.save(assignment);
 }

 @Override
 public List<EmployeeShift> getEmployeeShifts(Long employeeId) {
     return employeeShiftRepository
             .findByEmployeeIdOrderByEffectiveFromDesc(employeeId);
 }

 @Override
 public List<Map<String, Object>> getRoster() {
     return employeeShiftRepository.findByIsActiveTrue()
             .stream().map(es -> {
                 Map<String, Object> map = new HashMap<>();
                 map.put("employeeId", es.getEmployee().getId());
                 map.put("employeeName", es.getEmployee().getFullName());
                 map.put("employeeCode", es.getEmployee().getEmployeeId());
                 map.put("shiftName", es.getShift().getName());
                 map.put("startTime", es.getShift().getStartTime().toString());
                 map.put("endTime", es.getShift().getEndTime().toString());
                 map.put("workingHours", es.getShift().getWorkingHours());
                 map.put("effectiveFrom", es.getEffectiveFrom());
                 return map;
             })
             .collect(Collectors.toList());
 }

 @Override
 public OvertimeRecord createOvertime(OvertimeRecord record) {
     return overtimeRepository.save(record);
 }

 @Override
 public List<OvertimeRecord> getAllOvertime() {
     return overtimeRepository.findAllByOrderByCreatedAtDesc();
 }

 @Override
 public OvertimeRecord approveOvertime(Long id, String status) {
     OvertimeRecord record = overtimeRepository.findById(id)
             .orElseThrow(() -> new ResourceNotFoundException(
                 "Overtime", "id", id));
     record.setStatus(OvertimeRecord.Status.valueOf(status));
     record.setApprovedAt(LocalDateTime.now());
     return overtimeRepository.save(record);
 }

 private Double calculateWorkingHours(Shift shift) {
     Duration duration;
     if (shift.getIsNightShift()) {
         duration = Duration.between(shift.getStartTime(),
             shift.getEndTime().plusHours(24));
     } else {
         duration = Duration.between(shift.getStartTime(), shift.getEndTime());
     }
     double hours = duration.toMinutes() / 60.0;
     hours -= (shift.getBreakMinutes() != null ?
               shift.getBreakMinutes() : 60) / 60.0;
     return Math.max(0, hours);
 }
}