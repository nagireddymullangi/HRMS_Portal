
//repository/EmployeeShiftRepository.java
package com.hrms.repository;

import com.hrms.model.EmployeeShift;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface EmployeeShiftRepository extends JpaRepository<EmployeeShift, Long> {
List<EmployeeShift> findByEmployeeIdOrderByEffectiveFromDesc(Long employeeId);
Optional<EmployeeShift> findByEmployeeIdAndIsActiveTrue(Long employeeId);
List<EmployeeShift> findByIsActiveTrue();
}
