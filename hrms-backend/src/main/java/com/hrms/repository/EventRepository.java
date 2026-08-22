
//repository/EventRepository.java
package com.hrms.repository;

import com.hrms.model.Event;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface EventRepository extends JpaRepository<Event, Long> {

 @Query("SELECT e FROM Event e WHERE e.isActive = true " +
        "ORDER BY e.startDateTime ASC")
 List<Event> findAllActive();

 @Query("SELECT e FROM Event e WHERE e.isActive = true " +
        "AND e.startDateTime BETWEEN :start AND :end " +
        "ORDER BY e.startDateTime ASC")
 List<Event> findByDateRange(
     @Param("start") LocalDateTime start,
     @Param("end") LocalDateTime end);

 @Query("SELECT e FROM Event e WHERE e.isActive = true " +
        "AND e.startDateTime > :now " +
        "ORDER BY e.startDateTime ASC")
 List<Event> findUpcoming(@Param("now") LocalDateTime now);

 @Query("SELECT e FROM Event e WHERE e.isActive = true " +
        "AND (e.targetAudience = 'ALL' " +
        "   OR (e.targetAudience = 'DEPARTMENT' AND e.department.id = :deptId)) " +
        "ORDER BY e.startDateTime ASC")
 List<Event> findForEmployee(@Param("deptId") Long deptId);

 @Query("SELECT COUNT(e) FROM Event e WHERE e.isActive = true " +
        "AND e.startDateTime > :now")
 Long countUpcoming(@Param("now") LocalDateTime now);
}