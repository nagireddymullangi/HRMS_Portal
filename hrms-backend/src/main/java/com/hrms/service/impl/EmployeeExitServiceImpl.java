
//service/impl/EmployeeExitServiceImpl.java
package com.hrms.service.impl;

import com.hrms.dto.request.EmployeeExitRequest;
import com.hrms.dto.request.ExitUpdateRequest;
import com.hrms.dto.response.EmployeeExitResponse;
import com.hrms.exception.HrmsAPIException;
import com.hrms.exception.ResourceNotFoundException;
import com.hrms.model.Employee;
import com.hrms.model.EmployeeExit;
import com.hrms.repository.EmployeeExitRepository;
import com.hrms.repository.EmployeeRepository;
import com.hrms.service.EmployeeExitService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmployeeExitServiceImpl implements EmployeeExitService {

 private final EmployeeExitRepository exitRepository;
 private final EmployeeRepository employeeRepository;

 @Override
 @Transactional
 public EmployeeExitResponse initiate(EmployeeExitRequest request) {
     Employee employee = employeeRepository.findById(request.getEmployeeId())
             .orElseThrow(() -> new ResourceNotFoundException(
                     "Employee", "id", request.getEmployeeId()));

     exitRepository.findByEmployeeIdAndStatusNot(
             request.getEmployeeId(), EmployeeExit.Status.CANCELLED)
             .ifPresent(existing -> {
                 if (existing.getStatus() != EmployeeExit.Status.COMPLETED) {
                     throw new HrmsAPIException(HttpStatus.BAD_REQUEST,
                             "Active exit request already exists");
                 }
             });

     EmployeeExit exit = EmployeeExit.builder()
             .employee(employee)
             .resignationDate(request.getResignationDate())
             .lastWorkingDate(request.getLastWorkingDate())
             .noticePeriodDays(request.getNoticePeriodDays() != null ?
                     request.getNoticePeriodDays() : 30)
             .reason(EmployeeExit.ExitReason.valueOf(request.getReason()))
             .detailedReason(request.getDetailedReason())
             .status(EmployeeExit.Status.PENDING)
             .build();

     return mapToResponse(exitRepository.save(exit));
 }

 @Override
 public EmployeeExitResponse getById(Long id) {
     return mapToResponse(exitRepository.findById(id)
             .orElseThrow(() -> new ResourceNotFoundException(
                     "Employee Exit", "id", id)));
 }

 @Override
 public List<EmployeeExitResponse> getAll() {
     return exitRepository.findAllByOrderByCreatedAtDesc()
             .stream().map(this::mapToResponse)
             .collect(Collectors.toList());
 }

 @Override
 public List<EmployeeExitResponse> getByEmployee(Long employeeId) {
     return exitRepository.findByEmployeeIdOrderByCreatedAtDesc(employeeId)
             .stream().map(this::mapToResponse)
             .collect(Collectors.toList());
 }

 @Override
 @Transactional
 public EmployeeExitResponse update(Long id, ExitUpdateRequest request) {
     EmployeeExit exit = exitRepository.findById(id)
             .orElseThrow(() -> new ResourceNotFoundException(
                     "Employee Exit", "id", id));

     if (request.getStatus() != null)
         exit.setStatus(EmployeeExit.Status.valueOf(request.getStatus()));
     if (request.getItClearance() != null)
         exit.setItClearance(request.getItClearance());
     if (request.getHrClearance() != null)
         exit.setHrClearance(request.getHrClearance());
     if (request.getFinanceClearance() != null)
         exit.setFinanceClearance(request.getFinanceClearance());
     if (request.getManagerClearance() != null)
         exit.setManagerClearance(request.getManagerClearance());
     if (request.getAdminClearance() != null)
         exit.setAdminClearance(request.getAdminClearance());
     if (request.getFinalSettlementAmount() != null)
         exit.setFinalSettlementAmount(request.getFinalSettlementAmount());
     if (request.getSettlementPaid() != null)
         exit.setSettlementPaid(request.getSettlementPaid());
     if (request.getSettlementDate() != null)
         exit.setSettlementDate(request.getSettlementDate());
     if (request.getExitInterviewCompleted() != null)
         exit.setExitInterviewCompleted(request.getExitInterviewCompleted());
     if (request.getExitInterviewNotes() != null)
         exit.setExitInterviewNotes(request.getExitInterviewNotes());
     if (request.getExperienceLetterIssued() != null)
         exit.setExperienceLetterIssued(request.getExperienceLetterIssued());
     if (request.getExperienceLetterDate() != null)
         exit.setExperienceLetterDate(request.getExperienceLetterDate());
     if (request.getRehireEligible() != null)
         exit.setRehireEligible(request.getRehireEligible());

     // Auto-complete if all clearances done
     if (Boolean.TRUE.equals(exit.getItClearance()) &&
             Boolean.TRUE.equals(exit.getHrClearance()) &&
             Boolean.TRUE.equals(exit.getFinanceClearance()) &&
             Boolean.TRUE.equals(exit.getManagerClearance()) &&
             Boolean.TRUE.equals(exit.getAdminClearance()) &&
             Boolean.TRUE.equals(exit.getSettlementPaid()) &&
             Boolean.TRUE.equals(exit.getExperienceLetterIssued())) {
         exit.setStatus(EmployeeExit.Status.COMPLETED);

         // Mark employee as inactive
         Employee emp = exit.getEmployee();
         emp.setStatus(Employee.Status.INACTIVE);
         employeeRepository.save(emp);
     }

     return mapToResponse(exitRepository.save(exit));
 }

 @Override
 @Transactional
 public EmployeeExitResponse approveExit(Long id) {
     EmployeeExit exit = exitRepository.findById(id)
             .orElseThrow(() -> new ResourceNotFoundException(
                     "Employee Exit", "id", id));

     exit.setStatus(EmployeeExit.Status.APPROVED);
     exit.setApprovedAt(LocalDateTime.now());
     return mapToResponse(exitRepository.save(exit));
 }

 @Override
 @Transactional
 public void cancel(Long id) {
     EmployeeExit exit = exitRepository.findById(id)
             .orElseThrow(() -> new ResourceNotFoundException(
                     "Employee Exit", "id", id));
     exit.setStatus(EmployeeExit.Status.CANCELLED);
     exitRepository.save(exit);
 }

 private EmployeeExitResponse mapToResponse(EmployeeExit exit) {
     Employee emp = exit.getEmployee();
     return EmployeeExitResponse.builder()
             .id(exit.getId())
             .employeeId(emp.getId())
             .employeeName(emp.getFullName())
             .employeeCode(emp.getEmployeeId())
             .designation(emp.getDesignation())
             .departmentName(emp.getDepartment() != null ?
                     emp.getDepartment().getName() : null)
             .dateOfJoining(emp.getDateOfJoining())
             .resignationDate(exit.getResignationDate())
             .lastWorkingDate(exit.getLastWorkingDate())
             .noticePeriodDays(exit.getNoticePeriodDays())
             .reason(exit.getReason().name())
             .detailedReason(exit.getDetailedReason())
             .status(exit.getStatus().name())
             .approvedAt(exit.getApprovedAt())
             .itClearance(exit.getItClearance())
             .hrClearance(exit.getHrClearance())
             .financeClearance(exit.getFinanceClearance())
             .managerClearance(exit.getManagerClearance())
             .adminClearance(exit.getAdminClearance())
             .clearanceProgress(exit.getClearanceProgress())
             .finalSettlementAmount(exit.getFinalSettlementAmount())
             .settlementPaid(exit.getSettlementPaid())
             .settlementDate(exit.getSettlementDate())
             .exitInterviewCompleted(exit.getExitInterviewCompleted())
             .exitInterviewNotes(exit.getExitInterviewNotes())
             .experienceLetterIssued(exit.getExperienceLetterIssued())
             .experienceLetterDate(exit.getExperienceLetterDate())
             .rehireEligible(exit.getRehireEligible())
             .createdAt(exit.getCreatedAt())
             .build();
 }
}