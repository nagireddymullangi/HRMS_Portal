
//service/impl/TrainingServiceImpl.java
package com.hrms.service.impl;

import com.hrms.dto.response.TrainingEnrollmentResponse;
import com.hrms.dto.response.TrainingProgramResponse;
import com.hrms.exception.HrmsAPIException;
import com.hrms.exception.ResourceNotFoundException;
import com.hrms.model.*;
import com.hrms.repository.*;
import com.hrms.service.TrainingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class TrainingServiceImpl implements TrainingService {

 private final TrainingProgramRepository programRepository;
 private final TrainingEnrollmentRepository enrollmentRepository;
 private final EmployeeRepository employeeRepository;

 @Override
 @Transactional
 public TrainingProgramResponse createProgram(TrainingProgram program) {
     if (program.getProgramCode() == null) {
         program.setProgramCode(generateProgramCode());
     }
     TrainingProgram saved = programRepository.save(program);
     return mapProgramToResponse(saved, null);
 }

 @Override
 @Transactional
 public TrainingProgramResponse updateProgram(Long id, TrainingProgram program) {
     TrainingProgram existing = programRepository.findById(id)
             .orElseThrow(() -> new ResourceNotFoundException(
                 "Program", "id", id));

     existing.setTitle(program.getTitle());
     existing.setDescription(program.getDescription());
     existing.setCategory(program.getCategory());
     existing.setTrainingType(program.getTrainingType());
     existing.setDurationHours(program.getDurationHours());
     existing.setTrainerName(program.getTrainerName());
     existing.setTrainerEmail(program.getTrainerEmail());
     existing.setMaxParticipants(program.getMaxParticipants());
     existing.setStartDate(program.getStartDate());
     existing.setEndDate(program.getEndDate());
     existing.setLocation(program.getLocation());
     existing.setMeetingLink(program.getMeetingLink());
     existing.setCostPerParticipant(program.getCostPerParticipant());
     existing.setMaterialsUrl(program.getMaterialsUrl());
     existing.setPrerequisites(program.getPrerequisites());
     existing.setLearningObjectives(program.getLearningObjectives());
     existing.setIsMandatory(program.getIsMandatory());
     existing.setStatus(program.getStatus());

     return mapProgramToResponse(programRepository.save(existing), null);
 }

 @Override
 public TrainingProgramResponse getProgram(Long id, Long employeeId) {
     TrainingProgram program = programRepository.findById(id)
             .orElseThrow(() -> new ResourceNotFoundException(
                 "Program", "id", id));
     return mapProgramToResponse(program, employeeId);
 }

 @Override
 public List<TrainingProgramResponse> getAllPrograms() {
     return programRepository.findAllByOrderByStartDateDesc()
             .stream().map(p -> mapProgramToResponse(p, null))
             .collect(Collectors.toList());
 }

 @Override
 public List<TrainingProgramResponse> getProgramsByCategory(String category) {
     return programRepository.findByCategoryAndStatus(
             TrainingProgram.Category.valueOf(category),
             TrainingProgram.Status.OPEN_FOR_ENROLLMENT)
             .stream().map(p -> mapProgramToResponse(p, null))
             .collect(Collectors.toList());
 }

 @Override
 public List<TrainingProgramResponse> getOpenPrograms(Long employeeId) {
     return programRepository.findByStatus(
             TrainingProgram.Status.OPEN_FOR_ENROLLMENT)
             .stream().map(p -> mapProgramToResponse(p, employeeId))
             .collect(Collectors.toList());
 }

 @Override
 public void deleteProgram(Long id) {
     programRepository.deleteById(id);
 }

 @Override
 @Transactional
 public TrainingProgramResponse updateStatus(Long id, String status) {
     TrainingProgram program = programRepository.findById(id)
             .orElseThrow(() -> new ResourceNotFoundException(
                 "Program", "id", id));
     program.setStatus(TrainingProgram.Status.valueOf(status));
     return mapProgramToResponse(programRepository.save(program), null);
 }

 @Override
 @Transactional
 public TrainingEnrollmentResponse enroll(Long programId, Long employeeId) {
     TrainingProgram program = programRepository.findById(programId)
             .orElseThrow(() -> new ResourceNotFoundException(
                 "Program", "id", programId));

     Employee employee = employeeRepository.findById(employeeId)
             .orElseThrow(() -> new ResourceNotFoundException(
                 "Employee", "id", employeeId));

     // Check if already enrolled
     if (enrollmentRepository.findByProgramIdAndEmployeeId(
             programId, employeeId).isPresent()) {
         throw new HrmsAPIException(HttpStatus.BAD_REQUEST,
             "Already enrolled in this program");
     }

     // Check capacity
     if (program.getMaxParticipants() != null) {
         Long currentEnrolled = enrollmentRepository
             .countByProgramId(programId);
         if (currentEnrolled >= program.getMaxParticipants()) {
             throw new HrmsAPIException(HttpStatus.BAD_REQUEST,
                 "Program is full");
         }
     }

     // Check status
     if (program.getStatus() != TrainingProgram.Status.OPEN_FOR_ENROLLMENT
         && program.getStatus() != TrainingProgram.Status.IN_PROGRESS) {
         throw new HrmsAPIException(HttpStatus.BAD_REQUEST,
             "Program not open for enrollment");
     }

     TrainingEnrollment enrollment = TrainingEnrollment.builder()
             .program(program)
             .employee(employee)
             .status(TrainingEnrollment.Status.ENROLLED)
             .build();

     return mapEnrollmentToResponse(enrollmentRepository.save(enrollment));
 }

 @Override
 @Transactional
 public TrainingEnrollmentResponse updateEnrollment(
         Long id, TrainingEnrollment enrollment) {
     TrainingEnrollment existing = enrollmentRepository.findById(id)
             .orElseThrow(() -> new ResourceNotFoundException(
                 "Enrollment", "id", id));

     if (enrollment.getStatus() != null) existing.setStatus(enrollment.getStatus());
     if (enrollment.getScore() != null) existing.setScore(enrollment.getScore());
     if (enrollment.getGrade() != null) existing.setGrade(enrollment.getGrade());
     if (enrollment.getCertificateUrl() != null)
         existing.setCertificateUrl(enrollment.getCertificateUrl());

     return mapEnrollmentToResponse(enrollmentRepository.save(existing));
 }

 @Override
 @Transactional
 public TrainingEnrollmentResponse markComplete(Long id, BigDecimal score,
                                                  String grade,
                                                  String certificateUrl) {
     TrainingEnrollment enrollment = enrollmentRepository.findById(id)
             .orElseThrow(() -> new ResourceNotFoundException(
                 "Enrollment", "id", id));

     enrollment.setStatus(TrainingEnrollment.Status.COMPLETED);
     enrollment.setCompletionDate(LocalDate.now());
     enrollment.setScore(score);
     enrollment.setGrade(grade);
     enrollment.setCertificateUrl(certificateUrl);

     return mapEnrollmentToResponse(enrollmentRepository.save(enrollment));
 }

 @Override
 @Transactional
 public TrainingEnrollmentResponse submitFeedback(Long id, Integer rating,
                                                    String feedback) {
     TrainingEnrollment enrollment = enrollmentRepository.findById(id)
             .orElseThrow(() -> new ResourceNotFoundException(
                 "Enrollment", "id", id));

     enrollment.setRating(rating);
     enrollment.setFeedback(feedback);
     return mapEnrollmentToResponse(enrollmentRepository.save(enrollment));
 }

 @Override
 public List<TrainingEnrollmentResponse> getMyEnrollments(Long employeeId) {
     return enrollmentRepository
             .findByEmployeeIdOrderByEnrolledDateDesc(employeeId)
             .stream().map(this::mapEnrollmentToResponse)
             .collect(Collectors.toList());
 }

 @Override
 public List<TrainingEnrollmentResponse> getEnrollmentsByProgram(
         Long programId) {
     return enrollmentRepository
             .findByProgramIdOrderByEnrolledDateDesc(programId)
             .stream().map(this::mapEnrollmentToResponse)
             .collect(Collectors.toList());
 }

 @Override
 public void dropEnrollment(Long id) {
     TrainingEnrollment enrollment = enrollmentRepository.findById(id)
             .orElseThrow(() -> new ResourceNotFoundException(
                 "Enrollment", "id", id));
     enrollment.setStatus(TrainingEnrollment.Status.DROPPED);
     enrollmentRepository.save(enrollment);
 }

 @Override
 public Map<String, Object> getStatistics() {
     Map<String, Object> stats = new HashMap<>();
     stats.put("totalPrograms", programRepository.count());
     stats.put("openPrograms", programRepository.countByStatus(
         TrainingProgram.Status.OPEN_FOR_ENROLLMENT));
     stats.put("inProgressPrograms", programRepository.countByStatus(
         TrainingProgram.Status.IN_PROGRESS));
     stats.put("completedPrograms", programRepository.countByStatus(
         TrainingProgram.Status.COMPLETED));
     stats.put("totalEnrollments", enrollmentRepository.count());
     return stats;
 }

 @Override
 public Map<String, Object> getEmployeeLearningStats(Long employeeId) {
     Map<String, Object> stats = new HashMap<>();
     List<TrainingEnrollment> all = enrollmentRepository
             .findByEmployeeIdOrderByEnrolledDateDesc(employeeId);

     stats.put("totalEnrollments", all.size());
     stats.put("completed", all.stream()
         .filter(e -> e.getStatus() == TrainingEnrollment.Status.COMPLETED)
         .count());
     stats.put("inProgress", all.stream()
         .filter(e -> e.getStatus() == TrainingEnrollment.Status.IN_PROGRESS ||
                       e.getStatus() == TrainingEnrollment.Status.ENROLLED)
         .count());
     stats.put("certificates", all.stream()
         .filter(e -> e.getCertificateUrl() != null &&
                       !e.getCertificateUrl().isEmpty())
         .count());

     BigDecimal totalHours = all.stream()
         .filter(e -> e.getStatus() == TrainingEnrollment.Status.COMPLETED)
         .map(e -> e.getProgram().getDurationHours() != null
             ? e.getProgram().getDurationHours() : BigDecimal.ZERO)
         .reduce(BigDecimal.ZERO, BigDecimal::add);
     stats.put("totalLearningHours", totalHours);

     return stats;
 }

 private String generateProgramCode() {
     long count = programRepository.count() + 1;
     return String.format("TRN-%d-%04d", LocalDate.now().getYear(), count);
 }

 private TrainingProgramResponse mapProgramToResponse(
         TrainingProgram p, Long employeeId) {
     Long totalEnrolled = enrollmentRepository.countByProgramId(p.getId());
     Long totalCompleted = enrollmentRepository
             .countCompletedByProgramId(p.getId());
     Double avgRating = enrollmentRepository
             .averageRatingByProgramId(p.getId());

     Boolean isEnrolled = false;
     String myStatus = null;

     if (employeeId != null) {
         Optional<TrainingEnrollment> enrollment = enrollmentRepository
             .findByProgramIdAndEmployeeId(p.getId(), employeeId);
         if (enrollment.isPresent()) {
             isEnrolled = true;
             myStatus = enrollment.get().getStatus().name();
         }
     }

     return TrainingProgramResponse.builder()
             .id(p.getId())
             .programCode(p.getProgramCode())
             .title(p.getTitle())
             .description(p.getDescription())
             .category(p.getCategory().name())
             .trainingType(p.getTrainingType().name())
             .durationHours(p.getDurationHours())
             .trainerName(p.getTrainerName())
             .trainerEmail(p.getTrainerEmail())
             .maxParticipants(p.getMaxParticipants())
             .startDate(p.getStartDate())
             .endDate(p.getEndDate())
             .location(p.getLocation())
             .meetingLink(p.getMeetingLink())
             .costPerParticipant(p.getCostPerParticipant())
             .materialsUrl(p.getMaterialsUrl())
             .prerequisites(p.getPrerequisites())
             .learningObjectives(p.getLearningObjectives())
             .status(p.getStatus().name())
             .isMandatory(p.getIsMandatory())
             .totalEnrolled(totalEnrolled)
             .totalCompleted(totalCompleted)
             .averageRating(avgRating != null
                 ? Math.round(avgRating * 100.0) / 100.0 : 0)
             .isEnrolled(isEnrolled)
             .myStatus(myStatus)
             .createdAt(p.getCreatedAt())
             .build();
 }

 private TrainingEnrollmentResponse mapEnrollmentToResponse(
         TrainingEnrollment e) {
     return TrainingEnrollmentResponse.builder()
             .id(e.getId())
             .programId(e.getProgram().getId())
             .programCode(e.getProgram().getProgramCode())
             .programTitle(e.getProgram().getTitle())
             .programCategory(e.getProgram().getCategory().name())
             .trainingType(e.getProgram().getTrainingType().name())
             .durationHours(e.getProgram().getDurationHours())
             .employeeId(e.getEmployee().getId())
             .employeeName(e.getEmployee().getFullName())
             .employeeCode(e.getEmployee().getEmployeeId())
             .enrolledDate(e.getEnrolledDate())
             .status(e.getStatus().name())
             .completionDate(e.getCompletionDate())
             .score(e.getScore())
             .grade(e.getGrade())
             .certificateUrl(e.getCertificateUrl())
             .feedback(e.getFeedback())
             .rating(e.getRating())
             .build();
 }
}