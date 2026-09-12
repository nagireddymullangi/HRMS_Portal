package com.hrms.repository;

import com.hrms.model.DailyWorkAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface DailyWorkAssignmentRepository extends JpaRepository<DailyWorkAssignment, Long> {

    List<DailyWorkAssignment> findByEmployeeIdAndAssignmentDateOrderByPriorityDesc(Long employeeId, LocalDate date);
    
    List<DailyWorkAssignment> findByEmployeeIdOrderByAssignmentDateDesc(Long employeeId);
    
    List<DailyWorkAssignment> findByEmployeeIdAndAssignmentDateBetweenOrderByAssignmentDateDesc(
            Long employeeId, LocalDate start, LocalDate end);

    @Query("SELECT a FROM DailyWorkAssignment a WHERE a.assignmentDate = :date ORDER BY a.employee.firstName")
    List<DailyWorkAssignment> findAllByDate(@Param("date") LocalDate date);

    @Query("SELECT a FROM DailyWorkAssignment a WHERE a.dueDate < :today AND a.status NOT IN ('COMPLETED', 'CANCELLED')")
    List<DailyWorkAssignment> findOverdue(@Param("today") LocalDate today);
}