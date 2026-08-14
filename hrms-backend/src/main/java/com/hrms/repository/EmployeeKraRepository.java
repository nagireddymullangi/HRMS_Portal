
//repository/EmployeeKraRepository.java
package com.hrms.repository;

import com.hrms.model.EmployeeKra;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface EmployeeKraRepository extends JpaRepository<EmployeeKra, Long> {
List<EmployeeKra> findByEmployeeIdAndCycleId(Long employeeId, Long cycleId);
List<EmployeeKra> findByCycleId(Long cycleId);
List<EmployeeKra> findByEmployeeIdOrderByCreatedAtDesc(Long employeeId);
}