
//repository/FaceEnrollmentRepository.java
package com.hrms.repository;

import com.hrms.model.FaceEnrollment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface FaceEnrollmentRepository extends JpaRepository<FaceEnrollment, Long> {
 Optional<FaceEnrollment> findByEmployeeIdAndIsActiveTrue(Long employeeId);
 List<FaceEnrollment> findByIsActiveTrue();
 boolean existsByEmployeeId(Long employeeId);
 Optional<FaceEnrollment> findByEmployeeId(Long employeeId);
}