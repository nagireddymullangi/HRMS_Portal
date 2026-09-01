
//repository/HrPolicyRepository.java
package com.hrms.repository;

import com.hrms.model.HrPolicy;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HrPolicyRepository extends JpaRepository<HrPolicy, Long> {
 List<HrPolicy> findByStatus(HrPolicy.Status status);
 List<HrPolicy> findByCategory(HrPolicy.Category category);
 List<HrPolicy> findAllByOrderByEffectiveDateDesc();
 Long countByStatus(HrPolicy.Status status);
}