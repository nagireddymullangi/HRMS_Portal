
//repository/PerformanceCycleRepository.java
package com.hrms.repository;

import com.hrms.model.PerformanceCycle;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PerformanceCycleRepository extends JpaRepository<PerformanceCycle, Long> {
 List<PerformanceCycle> findByStatus(PerformanceCycle.Status status);
 List<PerformanceCycle> findAllByOrderByStartDateDesc();
}

