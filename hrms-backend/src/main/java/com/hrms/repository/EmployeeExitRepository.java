
//repository/EmployeeExitRepository.java
package com.hrms.repository;

import com.hrms.model.EmployeeExit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EmployeeExitRepository extends JpaRepository<EmployeeExit, Long> {

 List<EmployeeExit> findAllByOrderByCreatedAtDesc();

 List<EmployeeExit> findByStatusOrderByCreatedAtDesc(EmployeeExit.Status status);

 Optional<EmployeeExit> findByEmployeeIdAndStatusNot(
     Long employeeId, EmployeeExit.Status status);

 List<EmployeeExit> findByEmployeeIdOrderByCreatedAtDesc(Long employeeId);

 @Query("SELECT COUNT(e) FROM EmployeeExit e WHERE e.status = :status")
 Long countByStatus(@Param("status") EmployeeExit.Status status);
}