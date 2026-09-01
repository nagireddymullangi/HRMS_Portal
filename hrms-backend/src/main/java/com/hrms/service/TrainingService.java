
//service/TrainingService.java
package com.hrms.service;

import com.hrms.dto.response.TrainingEnrollmentResponse;
import com.hrms.dto.response.TrainingProgramResponse;
import com.hrms.model.TrainingProgram;
import com.hrms.model.TrainingEnrollment;

import java.util.List;
import java.util.Map;

public interface TrainingService {
 // Programs
 TrainingProgramResponse createProgram(TrainingProgram program);
 TrainingProgramResponse updateProgram(Long id, TrainingProgram program);
 TrainingProgramResponse getProgram(Long id, Long employeeId);
 List<TrainingProgramResponse> getAllPrograms();
 List<TrainingProgramResponse> getProgramsByCategory(String category);
 List<TrainingProgramResponse> getOpenPrograms(Long employeeId);
 void deleteProgram(Long id);
 TrainingProgramResponse updateStatus(Long id, String status);

 // Enrollments
 TrainingEnrollmentResponse enroll(Long programId, Long employeeId);
 TrainingEnrollmentResponse updateEnrollment(Long id, TrainingEnrollment enrollment);
 TrainingEnrollmentResponse markComplete(Long id, java.math.BigDecimal score,
                                           String grade, String certificateUrl);
 TrainingEnrollmentResponse submitFeedback(Long id, Integer rating,
                                             String feedback);
 List<TrainingEnrollmentResponse> getMyEnrollments(Long employeeId);
 List<TrainingEnrollmentResponse> getEnrollmentsByProgram(Long programId);
 void dropEnrollment(Long id);

 // Statistics
 Map<String, Object> getStatistics();
 Map<String, Object> getEmployeeLearningStats(Long employeeId);
}