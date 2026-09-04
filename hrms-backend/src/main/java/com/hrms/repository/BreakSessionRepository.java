package com.hrms.repository;

import com.hrms.model.BreakSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface BreakSessionRepository extends JpaRepository<BreakSession, Long> {
    Optional<BreakSession> findByEmployeeIdAndStatus(Long employeeId, BreakSession.Status status);
    
    List<BreakSession> findByEmployeeIdOrderByStartTimeDesc(Long employeeId);

    @Query("SELECT b FROM BreakSession b WHERE b.status = 'ACTIVE' ORDER BY b.startTime DESC")
    List<BreakSession> findAllActive();

    @Query("SELECT SUM(b.durationMinutes) FROM BreakSession b WHERE b.employee.id = :empId " +
           "AND b.startTime BETWEEN :start AND :end AND b.status = 'COMPLETED'")
    Integer sumBreakMinutesByEmployeeAndDateRange(@Param("empId") Long empId, @Param("start") LocalDateTime start, @Param("end") LocalDateTime end);
}