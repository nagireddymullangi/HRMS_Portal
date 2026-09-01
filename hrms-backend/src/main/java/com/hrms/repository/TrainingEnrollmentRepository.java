
//repository/TrainingEnrollmentRepository.java
package com.hrms.repository;

import com.hrms.model.TrainingEnrollment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TrainingEnrollmentRepository
     extends JpaRepository<TrainingEnrollment, Long> {

 List<TrainingEnrollment> findByEmployeeIdOrderByEnrolledDateDesc(
     Long employeeId);

 List<TrainingEnrollment> findByProgramIdOrderByEnrolledDateDesc(
     Long programId);

 Optional<TrainingEnrollment> findByProgramIdAndEmployeeId(
     Long programId, Long employeeId);

 @Query("SELECT COUNT(e) FROM TrainingEnrollment e " +
        "WHERE e.program.id = :programId")
 Long countByProgramId(@Param("programId") Long programId);

 @Query("SELECT COUNT(e) FROM TrainingEnrollment e " +
        "WHERE e.program.id = :programId AND e.status = 'COMPLETED'")
 Long countCompletedByProgramId(@Param("programId") Long programId);

 @Query("SELECT AVG(e.rating) FROM TrainingEnrollment e " +
        "WHERE e.program.id = :programId AND e.rating IS NOT NULL")
 Double averageRatingByProgramId(@Param("programId") Long programId);

 List<TrainingEnrollment> findByEmployeeIdAndStatus(
     Long employeeId, TrainingEnrollment.Status status);
}