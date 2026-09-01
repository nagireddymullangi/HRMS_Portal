
//repository/TimesheetRepository.java
package com.hrms.repository;

import com.hrms.model.Timesheet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface TimesheetRepository extends JpaRepository<Timesheet, Long> {

 List<Timesheet> findByEmployeeIdOrderByWorkDateDesc(Long employeeId);

 List<Timesheet> findByEmployeeIdAndWorkDateBetweenOrderByWorkDateDesc(
     Long employeeId, LocalDate start, LocalDate end);

 List<Timesheet> findByProjectIdOrderByWorkDateDesc(Long projectId);

 List<Timesheet> findByStatusOrderByCreatedAtDesc(Timesheet.Status status);

 List<Timesheet> findAllByOrderByCreatedAtDesc();

 @Query("SELECT SUM(t.hoursWorked) FROM Timesheet t " +
        "WHERE t.employee.id = :empId " +
        "AND t.workDate BETWEEN :start AND :end")
 BigDecimal sumHoursByEmployeeAndDateRange(
     @Param("empId") Long empId,
     @Param("start") LocalDate start,
     @Param("end") LocalDate end);

 @Query("SELECT SUM(t.hoursWorked) FROM Timesheet t " +
        "WHERE t.project.id = :projectId AND t.status = 'APPROVED'")
 BigDecimal sumApprovedHoursByProject(@Param("projectId") Long projectId);

 @Query("SELECT COUNT(t) FROM Timesheet t WHERE t.status = :status")
 Long countByStatus(@Param("status") Timesheet.Status status);
}