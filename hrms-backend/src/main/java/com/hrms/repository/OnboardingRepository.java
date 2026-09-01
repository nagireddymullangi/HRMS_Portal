
//repository/OnboardingRepository.java
package com.hrms.repository;

import com.hrms.model.OnboardingProcess;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface OnboardingRepository extends JpaRepository<OnboardingProcess, Long> {
 Optional<OnboardingProcess> findByEmployeeId(Long employeeId);
 List<OnboardingProcess> findByStatus(OnboardingProcess.Status status);
 List<OnboardingProcess> findAllByOrderByCreatedAtDesc();
}

