
//repository/GrievanceRepository.java
package com.hrms.repository;

import com.hrms.model.Grievance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GrievanceRepository extends JpaRepository<Grievance, Long> {

 List<Grievance> findByEmployeeIdOrderByCreatedAtDesc(Long employeeId);

 List<Grievance> findByStatusOrderByCreatedAtDesc(Grievance.Status status);

 List<Grievance> findByAssignedToOrderByCreatedAtDesc(Long assignedTo);

 List<Grievance> findAllByOrderByCreatedAtDesc();

 @Query("SELECT COUNT(g) FROM Grievance g WHERE g.status = :status")
 Long countByStatus(@Param("status") Grievance.Status status);
}