
//repository/PolicyAcknowledgmentRepository.java
package com.hrms.repository;

import com.hrms.model.PolicyAcknowledgment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface PolicyAcknowledgmentRepository
     extends JpaRepository<PolicyAcknowledgment, Long> {

 Optional<PolicyAcknowledgment> findByPolicyIdAndEmployeeId(
     Long policyId, Long employeeId);

 List<PolicyAcknowledgment> findByPolicyId(Long policyId);

 List<PolicyAcknowledgment> findByEmployeeId(Long employeeId);

 Long countByPolicyId(Long policyId);
}