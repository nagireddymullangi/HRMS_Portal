
//repository/InterviewRepository.java
package com.hrms.repository;

import com.hrms.model.Interview;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDateTime;
import java.util.List;

public interface InterviewRepository extends JpaRepository<Interview, Long> {
 List<Interview> findByApplicationIdOrderByRoundNumberAsc(Long appId);
 List<Interview> findByScheduledDateBetween(LocalDateTime start, LocalDateTime end);
 List<Interview> findAllByOrderByScheduledDateDesc();
}