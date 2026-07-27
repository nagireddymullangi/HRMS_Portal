// repository/LeaveRepository.java
package com.hrms.repository;

import com.hrms.model.Leave;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface LeaveRepository extends JpaRepository<Leave, Long> {

    List<Leave> findByEmployeeIdOrderByAppliedAtDesc(Long employeeId);

    List<Leave> findByStatusOrderByAppliedAtDesc(Leave.Status status);

    List<Leave> findAllByOrderByAppliedAtDesc();

    @Query("SELECT COUNT(l) FROM Leave l WHERE l.status = :status")
    Long countByStatus(@Param("status") Leave.Status status);

    // ✅ NEW: Count by employee and status (for employee dashboard)
    @Query("SELECT COUNT(l) FROM Leave l WHERE l.employee.id = :empId " +
           "AND l.status = :status")
    Long countByEmployeeAndStatus(
            @Param("empId") Long empId,
            @Param("status") Leave.Status status);

    @Query("SELECT COUNT(l) FROM Leave l WHERE l.employee.id = :empId " +
           "AND l.leaveType.id = :typeId AND l.status = 'APPROVED' " +
           "AND YEAR(l.startDate) = :year")
    Long countApprovedLeavesByEmployeeAndType(
            @Param("empId") Long empId,
            @Param("typeId") Long typeId,
            @Param("year") int year);

    @Query("SELECT l FROM Leave l WHERE l.employee.id = :empId " +
           "AND l.status = 'APPROVED' " +
           "AND ((l.startDate <= :endDate) AND (l.endDate >= :startDate))")
    List<Leave> findOverlappingLeaves(
            @Param("empId") Long empId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);
}