
//repository/ComplianceEventRepository.java
package com.hrms.repository;

import com.hrms.model.ComplianceEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface ComplianceEventRepository
     extends JpaRepository<ComplianceEvent, Long> {

 List<ComplianceEvent> findByIsActiveTrueOrderByDueDateAsc();

 List<ComplianceEvent> findByStatusOrderByDueDateAsc(
     ComplianceEvent.Status status);

 @Query("SELECT c FROM ComplianceEvent c WHERE c.isActive = true " +
        "AND c.dueDate BETWEEN :start AND :end " +
        "ORDER BY c.dueDate ASC")
 List<ComplianceEvent> findByDateRange(
     @Param("start") LocalDate start,
     @Param("end") LocalDate end);

 @Query("SELECT c FROM ComplianceEvent c WHERE c.isActive = true " +
        "AND c.status = 'PENDING' AND c.dueDate < :today " +
        "ORDER BY c.dueDate ASC")
 List<ComplianceEvent> findOverdue(@Param("today") LocalDate today);

 @Query("SELECT c FROM ComplianceEvent c WHERE c.isActive = true " +
        "AND c.status = 'PENDING' AND c.dueDate BETWEEN :today AND :next " +
        "ORDER BY c.dueDate ASC")
 List<ComplianceEvent> findUpcoming(
     @Param("today") LocalDate today, @Param("next") LocalDate next);

 Long countByStatus(ComplianceEvent.Status status);
}