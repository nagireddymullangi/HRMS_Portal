
//repository/BankDetailsRepository.java
package com.hrms.repository;

import com.hrms.model.BankDetails;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface BankDetailsRepository extends JpaRepository<BankDetails, Long> {
 Optional<BankDetails> findByEmployeeId(Long employeeId);
 boolean existsByEmployeeId(Long employeeId);
}