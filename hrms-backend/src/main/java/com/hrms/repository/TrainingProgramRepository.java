
//repository/TrainingProgramRepository.java
package com.hrms.repository;

import com.hrms.model.TrainingProgram;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TrainingProgramRepository
     extends JpaRepository<TrainingProgram, Long> {

 List<TrainingProgram> findByStatus(TrainingProgram.Status status);

 List<TrainingProgram> findByCategoryAndStatus(
     TrainingProgram.Category category, TrainingProgram.Status status);

 List<TrainingProgram> findAllByOrderByStartDateDesc();

 Long countByStatus(TrainingProgram.Status status);
}