
//repository/EventAttendeeRepository.java
package com.hrms.repository;

import com.hrms.model.EventAttendee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface EventAttendeeRepository extends JpaRepository<EventAttendee, Long> {

 Optional<EventAttendee> findByEventIdAndEmployeeId(Long eventId, Long employeeId);

 List<EventAttendee> findByEventId(Long eventId);

 List<EventAttendee> findByEmployeeId(Long employeeId);

 @Query("SELECT COUNT(a) FROM EventAttendee a WHERE a.event.id = :eventId " +
        "AND a.rsvpStatus = 'ATTENDING'")
 Long countAttendingByEventId(@Param("eventId") Long eventId);
}