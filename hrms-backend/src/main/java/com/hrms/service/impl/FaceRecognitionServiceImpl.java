
//service/impl/FaceRecognitionServiceImpl.java
package com.hrms.service.impl;

import com.hrms.dto.request.FaceAttendanceRequest;
import com.hrms.dto.request.FaceEnrollmentRequest;
import com.hrms.dto.response.AttendanceResponse;
import com.hrms.dto.response.FaceVerificationResponse;
import com.hrms.exception.HrmsAPIException;
import com.hrms.exception.ResourceNotFoundException;
import com.hrms.model.*;
import com.hrms.repository.*;
import com.hrms.service.AttendanceService;
import com.hrms.service.FaceRecognitionService;
import com.hrms.utils.FileStorageService;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class FaceRecognitionServiceImpl implements FaceRecognitionService {

 private final FaceEnrollmentRepository enrollmentRepository;
 private final EmployeeRepository employeeRepository;
 private final AttendanceRepository attendanceRepository;
 private final AttendanceVerificationLogRepository verificationLogRepository;
 private final FileStorageService fileStorageService;
 private final AttendanceService attendanceService;
 private final ObjectMapper objectMapper = new ObjectMapper();

 // Threshold for face matching (0.0 - 1.0, higher = stricter)
 private static final double DEFAULT_THRESHOLD = 0.6;

 @Override
 @Transactional
 public FaceEnrollment enrollFace(FaceEnrollmentRequest request) {
     Employee employee = employeeRepository.findById(request.getEmployeeId())
             .orElseThrow(() -> new ResourceNotFoundException(
                 "Employee", "id", request.getEmployeeId()));

     // Check if already enrolled
     if (enrollmentRepository.existsByEmployeeId(request.getEmployeeId())) {
         throw new HrmsAPIException(HttpStatus.BAD_REQUEST,
             "Employee already enrolled. Please update instead.");
     }

     // Save face photo
     String photoUrl = null;
     if (request.getPhotoBase64() != null) {
         photoUrl = fileStorageService.saveBase64Image(
             request.getPhotoBase64(), "faces");
     }

     FaceEnrollment enrollment = FaceEnrollment.builder()
             .employee(employee)
             .faceDescriptor(request.getFaceDescriptor())
             .faceImageUrl(photoUrl)
             .qualityScore(request.getQualityScore())
             .isActive(true)
             .build();

     FaceEnrollment saved = enrollmentRepository.save(enrollment);
     log.info("Face enrolled for employee: {}", employee.getEmployeeId());
     return saved;
 }

 @Override
 @Transactional
 public FaceEnrollment updateEnrollment(Long employeeId,
                                          FaceEnrollmentRequest request) {
     FaceEnrollment existing = enrollmentRepository
             .findByEmployeeId(employeeId)
             .orElseThrow(() -> new ResourceNotFoundException(
                 "Face Enrollment", "employeeId", employeeId));

     // Delete old photo
     if (existing.getFaceImageUrl() != null) {
         fileStorageService.deleteFile(existing.getFaceImageUrl());
     }

     // Save new photo
     if (request.getPhotoBase64() != null) {
         String photoUrl = fileStorageService.saveBase64Image(
             request.getPhotoBase64(), "faces");
         existing.setFaceImageUrl(photoUrl);
     }

     existing.setFaceDescriptor(request.getFaceDescriptor());
     existing.setQualityScore(request.getQualityScore());
     existing.setIsActive(true);

     return enrollmentRepository.save(existing);
 }

 @Override
 public FaceEnrollment getEnrollment(Long employeeId) {
     return enrollmentRepository
             .findByEmployeeIdAndIsActiveTrue(employeeId)
             .orElseThrow(() -> new ResourceNotFoundException(
                 "Face Enrollment", "employeeId", employeeId));
 }

 @Override
 public List<FaceEnrollment> getAllEnrollments() {
     return enrollmentRepository.findByIsActiveTrue();
 }

 @Override
 @Transactional
 public void deleteEnrollment(Long employeeId) {
     FaceEnrollment enrollment = enrollmentRepository
             .findByEmployeeId(employeeId)
             .orElseThrow(() -> new ResourceNotFoundException(
                 "Face Enrollment", "employeeId", employeeId));

     if (enrollment.getFaceImageUrl() != null) {
         fileStorageService.deleteFile(enrollment.getFaceImageUrl());
     }

     enrollmentRepository.delete(enrollment);
     log.info("Face enrollment deleted for employee: {}", employeeId);
 }

 @Override
 public FaceVerificationResponse verifyFace(String faceDescriptor,
                                              Double threshold) {
     double threshhold = threshold != null ? threshold : DEFAULT_THRESHOLD;
     List<FaceEnrollment> enrollments = enrollmentRepository.findByIsActiveTrue();

     FaceEnrollment bestMatch = null;
     double bestScore = 0;

     // Compare with all enrolled faces
     for (FaceEnrollment enrollment : enrollments) {
         double similarity = calculateSimilarity(
             faceDescriptor, enrollment.getFaceDescriptor());

         if (similarity > bestScore) {
             bestScore = similarity;
             bestMatch = enrollment;
         }
     }

     if (bestMatch != null && bestScore >= threshhold) {
         Employee emp = bestMatch.getEmployee();
         return FaceVerificationResponse.builder()
                 .success(true)
                 .employeeId(emp.getId())
                 .employeeName(emp.getFullName())
                 .employeeCode(emp.getEmployeeId())
                 .confidenceScore(BigDecimal.valueOf(bestScore)
                     .setScale(2, RoundingMode.HALF_UP))
                 .message("Face verified successfully")
                 .build();
     }

     return FaceVerificationResponse.builder()
             .success(false)
             .confidenceScore(BigDecimal.valueOf(bestScore)
                 .setScale(2, RoundingMode.HALF_UP))
             .message("Face not recognized. Confidence too low: " +
                 String.format("%.2f", bestScore))
             .build();
 }

 @Override
 @Transactional
 public AttendanceResponse markAttendanceWithFace(
         FaceAttendanceRequest request) {

     // Verify face
     FaceVerificationResponse verification =
         verifyFace(request.getFaceDescriptor(), DEFAULT_THRESHOLD);

     // Log verification attempt
     Employee employee = null;
     if (verification.getEmployeeId() != null) {
         employee = employeeRepository.findById(verification.getEmployeeId())
             .orElse(null);
     }

     AttendanceVerificationLog log = AttendanceVerificationLog.builder()
             .employee(employee != null ? employee :
                 request.getEmployeeId() != null ?
                     employeeRepository.findById(request.getEmployeeId())
                         .orElse(null) : null)
             .verificationType(AttendanceVerificationLog.VerificationType.FACE)
             .verificationStatus(verification.isSuccess() ?
                 AttendanceVerificationLog.VerificationStatus.SUCCESS :
                 AttendanceVerificationLog.VerificationStatus.LOW_CONFIDENCE)
             .confidenceScore(verification.getConfidenceScore())
             .errorMessage(verification.getMessage())
             .build();

     verificationLogRepository.save(log);

     if (!verification.isSuccess()) {
         throw new HrmsAPIException(HttpStatus.UNAUTHORIZED,
             verification.getMessage());
     }

     // Save photo
     String photoUrl = null;
     if (request.getPhotoBase64() != null) {
         photoUrl = fileStorageService.saveBase64Image(
             request.getPhotoBase64(), "attendance");
     }

     // Get or create attendance
     LocalDate today = LocalDate.now();
     LocalTime now = LocalTime.now();

     Attendance attendance = attendanceRepository
             .findByEmployeeIdAndDate(employee.getId(), today)
             .orElse(null);

     boolean isCheckIn = attendance == null ||
                         attendance.getCheckIn() == null;

     if (attendance == null) {
         attendance = Attendance.builder()
                 .employee(employee)
                 .date(today)
                 .status(Attendance.Status.PRESENT)
                 .attendanceMode(Attendance.AttendanceMode.FACE_RECOGNITION)
                 .isVerified(true)
                 .verificationScore(verification.getConfidenceScore())
                 .build();
     }

     if (isCheckIn) {
         attendance.setCheckIn(now);
         attendance.setCheckInPhoto(photoUrl);
         attendance.setCheckInLatitude(request.getLatitude());
         attendance.setCheckInLongitude(request.getLongitude());
         attendance.setCheckInLocation(request.getLocation());
     } else {
         attendance.setCheckOut(now);
         attendance.setCheckOutPhoto(photoUrl);
         attendance.setCheckOutLatitude(request.getLatitude());
         attendance.setCheckOutLongitude(request.getLongitude());
         attendance.setCheckOutLocation(request.getLocation());

         // Calculate working hours
         if (attendance.getCheckIn() != null) {
             long minutes = java.time.Duration.between(
                 attendance.getCheckIn(), now).toMinutes();
             attendance.setWorkingHours(minutes / 60.0);
         }
     }

     attendance.setAttendanceMode(Attendance.AttendanceMode.FACE_RECOGNITION);
     attendance.setIsVerified(true);
     attendance.setVerificationScore(verification.getConfidenceScore());

     Attendance saved = attendanceRepository.save(attendance);

     return mapToAttendanceResponse(saved);
 }

 /**
  * Calculate similarity between two face descriptors
  * Face descriptors from face-api.js are 128-dimensional vectors
  * We calculate Euclidean distance and convert to similarity score
  */
 @Override
 public double calculateSimilarity(String desc1, String desc2) {
     try {
         double[] d1 = objectMapper.readValue(desc1, double[].class);
         double[] d2 = objectMapper.readValue(desc2, double[].class);

         if (d1.length != d2.length) {
             log.warn("Descriptor lengths don't match: {} vs {}",
                 d1.length, d2.length);
             return 0;
         }

         // Calculate Euclidean distance
         double sum = 0;
         for (int i = 0; i < d1.length; i++) {
             double diff = d1[i] - d2[i];
             sum += diff * diff;
         }
         double distance = Math.sqrt(sum);

         // Convert distance to similarity (0-1)
         // face-api.js typical threshold is 0.6 distance
         // We invert: similarity = 1 - (distance / max_expected_distance)
         double similarity = Math.max(0, 1 - (distance / 1.0));

         return similarity;
     } catch (Exception e) {
         log.error("Error calculating similarity", e);
         return 0;
     }
 }

 @Override
 public boolean isEnrolled(Long employeeId) {
     return enrollmentRepository.existsByEmployeeId(employeeId);
 }

 private AttendanceResponse mapToAttendanceResponse(Attendance a) {
     return com.hrms.dto.response.AttendanceResponse.builder()
             .id(a.getId())
             .employeeId(a.getEmployee().getId())
             .employeeName(a.getEmployee().getFullName())
             .employeeCode(a.getEmployee().getEmployeeId())
             .date(a.getDate())
             .checkIn(a.getCheckIn())
             .checkOut(a.getCheckOut())
             .status(a.getStatus().name())
             .workingHours(a.getWorkingHours())
             .notes(a.getNotes())
             .createdAt(a.getCreatedAt())
             .build();
 }
}