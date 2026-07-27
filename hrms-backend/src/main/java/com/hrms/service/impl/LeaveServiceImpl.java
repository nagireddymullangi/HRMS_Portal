
//service/impl/LeaveServiceImpl.java
package com.hrms.service.impl;

import com.hrms.dto.request.LeaveRequest;
import com.hrms.dto.request.LeaveStatusRequest;
import com.hrms.dto.response.LeaveResponse;
import com.hrms.exception.HrmsAPIException;
import com.hrms.exception.ResourceNotFoundException;
import com.hrms.model.Employee;
import com.hrms.model.Leave;
import com.hrms.model.LeaveType;
import com.hrms.repository.EmployeeRepository;
import com.hrms.repository.LeaveRepository;
import com.hrms.repository.LeaveTypeRepository;
import com.hrms.service.LeaveService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class LeaveServiceImpl implements LeaveService {

 private final LeaveRepository leaveRepository;
 private final EmployeeRepository employeeRepository;
 private final LeaveTypeRepository leaveTypeRepository;

 @Override
 @Transactional
 public LeaveResponse applyLeave(Long employeeId, LeaveRequest request) {
     Employee employee = employeeRepository.findById(employeeId)
             .orElseThrow(() -> new ResourceNotFoundException(
                     "Employee", "id", employeeId));

     LeaveType leaveType = leaveTypeRepository.findById(request.getLeaveTypeId())
             .orElseThrow(() -> new ResourceNotFoundException(
                     "LeaveType", "id", request.getLeaveTypeId()));

     if (request.getEndDate().isBefore(request.getStartDate())) {
         throw new HrmsAPIException(HttpStatus.BAD_REQUEST,
                 "End date cannot be before start date");
     }

     List<Leave> overlapping = leaveRepository.findOverlappingLeaves(
             employeeId, request.getStartDate(), request.getEndDate());
     if (!overlapping.isEmpty()) {
         throw new HrmsAPIException(HttpStatus.BAD_REQUEST,
                 "Leave already applied for overlapping dates");
     }

     int totalDays = (int) ChronoUnit.DAYS.between(
             request.getStartDate(), request.getEndDate()) + 1;

     Leave leave = Leave.builder()
             .employee(employee)
             .leaveType(leaveType)
             .startDate(request.getStartDate())
             .endDate(request.getEndDate())
             .totalDays(totalDays)
             .reason(request.getReason())
             .status(Leave.Status.PENDING)
             .build();

     Leave saved = leaveRepository.save(leave);
     log.info("Leave applied by employee: {}", employeeId);
     return mapToResponse(saved);
 }

 @Override
 public LeaveResponse getLeaveById(Long id) {
     return mapToResponse(leaveRepository.findById(id)
             .orElseThrow(() -> new ResourceNotFoundException(
                     "Leave", "id", id)));
 }

 @Override
 public List<LeaveResponse> getLeavesByEmployee(Long employeeId) {
     return leaveRepository.findByEmployeeIdOrderByAppliedAtDesc(employeeId)
             .stream().map(this::mapToResponse).collect(Collectors.toList());
 }

 @Override
 public List<LeaveResponse> getAllLeaves() {
     return leaveRepository.findAllByOrderByAppliedAtDesc()
             .stream().map(this::mapToResponse).collect(Collectors.toList());
 }

 @Override
 public List<LeaveResponse> getPendingLeaves() {
     return leaveRepository.findByStatusOrderByAppliedAtDesc(Leave.Status.PENDING)
             .stream().map(this::mapToResponse).collect(Collectors.toList());
 }

 @Override
 @Transactional
 public LeaveResponse updateLeaveStatus(Long id, LeaveStatusRequest request) {
     Leave leave = leaveRepository.findById(id)
             .orElseThrow(() -> new ResourceNotFoundException(
                     "Leave", "id", id));

     if (leave.getStatus() != Leave.Status.PENDING) {
         throw new HrmsAPIException(HttpStatus.BAD_REQUEST,
                 "Cannot update a leave that is already " + leave.getStatus());
     }

     leave.setStatus(Leave.Status.valueOf(request.getStatus()));
     leave.setAdminComment(request.getAdminComment());
     return mapToResponse(leaveRepository.save(leave));
 }

 @Override
 @Transactional
 public void deleteLeave(Long id) {
     Leave leave = leaveRepository.findById(id)
             .orElseThrow(() -> new ResourceNotFoundException(
                     "Leave", "id", id));
     if (leave.getStatus() != Leave.Status.PENDING) {
         throw new HrmsAPIException(HttpStatus.BAD_REQUEST,
                 "Only pending leaves can be deleted");
     }
     leaveRepository.delete(leave);
 }

 @Override
 public List<Object> getLeaveTypes() {
     return leaveTypeRepository.findAll()
             .stream()
             .map(lt -> (Object) new java.util.HashMap<String, Object>() {{
                 put("id", lt.getId());
                 put("name", lt.getName());
                 put("maxDays", lt.getMaxDays());
                 put("description", lt.getDescription());
             }})
             .collect(Collectors.toList());
 }

 private LeaveResponse mapToResponse(Leave leave) {
     return LeaveResponse.builder()
             .id(leave.getId())
             .employeeId(leave.getEmployee().getId())
             .employeeName(leave.getEmployee().getFullName())
             .employeeCode(leave.getEmployee().getEmployeeId())
             .departmentName(leave.getEmployee().getDepartment() != null ?
                     leave.getEmployee().getDepartment().getName() : null)
             .leaveTypeId(leave.getLeaveType().getId())
             .leaveTypeName(leave.getLeaveType().getName())
             .startDate(leave.getStartDate())
             .endDate(leave.getEndDate())
             .totalDays(leave.getTotalDays())
             .reason(leave.getReason())
             .status(leave.getStatus().name())
             .adminComment(leave.getAdminComment())
             .appliedAt(leave.getAppliedAt())
             .updatedAt(leave.getUpdatedAt())
             .build();
 }
}