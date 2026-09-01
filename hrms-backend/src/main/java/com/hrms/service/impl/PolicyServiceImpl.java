
//service/impl/PolicyServiceImpl.java
package com.hrms.service.impl;

import com.hrms.exception.HrmsAPIException;
import com.hrms.exception.ResourceNotFoundException;
import com.hrms.model.*;
import com.hrms.repository.*;
import com.hrms.service.PolicyService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class PolicyServiceImpl implements PolicyService {

 private final HrPolicyRepository policyRepository;
 private final PolicyAcknowledgmentRepository ackRepository;
 private final EmployeeRepository employeeRepository;

 @Override
 @Transactional
 public HrPolicy createPolicy(HrPolicy policy) {
     if (policy.getPolicyCode() == null) {
         policy.setPolicyCode(generatePolicyCode());
     }
     return policyRepository.save(policy);
 }

 @Override
 @Transactional
 public HrPolicy updatePolicy(Long id, HrPolicy policy) {
     HrPolicy existing = policyRepository.findById(id)
             .orElseThrow(() -> new ResourceNotFoundException(
                 "Policy", "id", id));

     existing.setTitle(policy.getTitle());
     existing.setDescription(policy.getDescription());
     existing.setContent(policy.getContent());
     existing.setCategory(policy.getCategory());
     existing.setEffectiveDate(policy.getEffectiveDate());
     existing.setExpiryDate(policy.getExpiryDate());
     existing.setIsMandatory(policy.getIsMandatory());
     existing.setRequiresAcknowledgment(policy.getRequiresAcknowledgment());
     existing.setDocumentUrl(policy.getDocumentUrl());
     existing.setStatus(policy.getStatus());

     return policyRepository.save(existing);
 }

 @Override
 public HrPolicy getPolicy(Long id) {
     return policyRepository.findById(id)
             .orElseThrow(() -> new ResourceNotFoundException(
                 "Policy", "id", id));
 }

 @Override
 public List<HrPolicy> getAllPolicies() {
     return policyRepository.findAllByOrderByEffectiveDateDesc();
 }

 @Override
 public List<HrPolicy> getActivePolicies() {
     return policyRepository.findByStatus(HrPolicy.Status.ACTIVE);
 }

 @Override
 public List<HrPolicy> getPoliciesByCategory(String category) {
     return policyRepository.findByCategory(
         HrPolicy.Category.valueOf(category));
 }

 @Override
 public void deletePolicy(Long id) {
     policyRepository.deleteById(id);
 }

 @Override
 @Transactional
 public HrPolicy updateStatus(Long id, String status) {
     HrPolicy policy = policyRepository.findById(id)
             .orElseThrow(() -> new ResourceNotFoundException(
                 "Policy", "id", id));
     policy.setStatus(HrPolicy.Status.valueOf(status));
     return policyRepository.save(policy);
 }

 @Override
 @Transactional
 public HrPolicy approvePolicy(Long id, Long approverId) {
     HrPolicy policy = policyRepository.findById(id)
             .orElseThrow(() -> new ResourceNotFoundException(
                 "Policy", "id", id));

     policy.setStatus(HrPolicy.Status.ACTIVE);
     policy.setApprovedBy(approverId);
     policy.setApprovedAt(LocalDateTime.now());
     return policyRepository.save(policy);
 }

 @Override
 @Transactional
 public PolicyAcknowledgment acknowledgePolicy(
         Long policyId, Long employeeId, String ipAddress,
         String signature, String comments) {

     // Check if already acknowledged
     Optional<PolicyAcknowledgment> existing = ackRepository
             .findByPolicyIdAndEmployeeId(policyId, employeeId);
     if (existing.isPresent()) {
         throw new HrmsAPIException(HttpStatus.BAD_REQUEST,
             "Policy already acknowledged");
     }

     HrPolicy policy = policyRepository.findById(policyId)
             .orElseThrow(() -> new ResourceNotFoundException(
                 "Policy", "id", policyId));

     Employee employee = employeeRepository.findById(employeeId)
             .orElseThrow(() -> new ResourceNotFoundException(
                 "Employee", "id", employeeId));

     PolicyAcknowledgment ack = PolicyAcknowledgment.builder()
             .policy(policy)
             .employee(employee)
             .ipAddress(ipAddress)
             .signature(signature)
             .comments(comments)
             .build();

     return ackRepository.save(ack);
 }

 @Override
 public List<PolicyAcknowledgment> getAcknowledgments(Long policyId) {
     return ackRepository.findByPolicyId(policyId);
 }

 @Override
 public List<HrPolicy> getPendingPoliciesForEmployee(Long employeeId) {
     List<HrPolicy> activePolicies = policyRepository
             .findByStatus(HrPolicy.Status.ACTIVE);

     Set<Long> acknowledgedIds = ackRepository
             .findByEmployeeId(employeeId)
             .stream().map(a -> a.getPolicy().getId())
             .collect(Collectors.toSet());

     return activePolicies.stream()
             .filter(p -> p.getRequiresAcknowledgment()
                           && !acknowledgedIds.contains(p.getId()))
             .collect(Collectors.toList());
 }

 @Override
 public Map<String, Object> getStatistics() {
     Map<String, Object> stats = new HashMap<>();
     stats.put("total", policyRepository.count());
     stats.put("active",
         policyRepository.countByStatus(HrPolicy.Status.ACTIVE));
     stats.put("draft",
         policyRepository.countByStatus(HrPolicy.Status.DRAFT));
     stats.put("archived",
         policyRepository.countByStatus(HrPolicy.Status.ARCHIVED));
     return stats;
 }

 @Override
 public Map<String, Object> getPolicyComplianceReport(Long policyId) {
     Map<String, Object> report = new HashMap<>();

     HrPolicy policy = getPolicy(policyId);
     Long totalEmployees = employeeRepository.count();
     Long acknowledged = ackRepository.countByPolicyId(policyId);

     report.put("policyTitle", policy.getTitle());
     report.put("totalEmployees", totalEmployees);
     report.put("acknowledged", acknowledged);
     report.put("pending", totalEmployees - acknowledged);
     report.put("compliancePercentage", totalEmployees > 0
         ? Math.round((acknowledged * 100.0) / totalEmployees * 100.0) / 100.0
         : 0);

     return report;
 }

 private String generatePolicyCode() {
     long count = policyRepository.count() + 1;
     return String.format("POL-%d-%04d", LocalDate.now().getYear(), count);
 }
}