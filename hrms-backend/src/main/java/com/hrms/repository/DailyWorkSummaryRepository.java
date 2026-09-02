
//repository/DailyWorkSummaryRepository.java
package com.hrms.repository;

import com.hrms.model.DailyWorkSummary;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface DailyWorkSummaryRepository
     extends JpaRepository<DailyWorkSummary, Long> {

 Optional<DailyWorkSummary> findByEmployeeIdAndSummaryDate(
     Long employeeId, LocalDate date);

 List<DailyWorkSummary> findByEmployeeIdAndSummaryDateBetween(
     Long employeeId, LocalDate start, LocalDate end);
}