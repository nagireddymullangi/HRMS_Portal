
//service/PolicyService.java
package com.hrms.service;

import com.hrms.model.HrPolicy;
import com.hrms.model.PolicyAcknowledgment;

import java.util.List;
import java.util.Map;

public interface PolicyService {
 HrPolicy createPolicy(HrPolicy policy);
 HrPolicy updatePolicy(Long id, HrPolicy policy);
 HrPolicy getPolicy(Long id);
 List<HrPolicy> getAllPolicies();
 List<HrPolicy> getActivePolicies();
 List<HrPolicy> getPoliciesByCategory(String category);
 void deletePolicy(Long id);
 HrPolicy updateStatus(Long id, String status);
 HrPolicy approvePolicy(Long id, Long approverId);

 // Acknowledgment
 PolicyAcknowledgment acknowledgePolicy(Long policyId, Long employeeId,
                                          String ipAddress, String signature,
                                          String comments);
 List<PolicyAcknowledgment> getAcknowledgments(Long policyId);
 List<HrPolicy> getPendingPoliciesForEmployee(Long employeeId);

 Map<String, Object> getStatistics();
 Map<String, Object> getPolicyComplianceReport(Long policyId);
}