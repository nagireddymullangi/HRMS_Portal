
//service/FaceRecognitionService.java
package com.hrms.service;

import com.hrms.dto.request.FaceAttendanceRequest;
import com.hrms.dto.request.FaceEnrollmentRequest;
import com.hrms.dto.response.AttendanceResponse;
import com.hrms.dto.response.FaceVerificationResponse;
import com.hrms.model.FaceEnrollment;

import java.util.List;

public interface FaceRecognitionService {

 // Enrollment
 FaceEnrollment enrollFace(FaceEnrollmentRequest request);
 FaceEnrollment updateEnrollment(Long employeeId,
                                   FaceEnrollmentRequest request);
 FaceEnrollment getEnrollment(Long employeeId);
 List<FaceEnrollment> getAllEnrollments();
 void deleteEnrollment(Long employeeId);

 // Verification & Attendance
 FaceVerificationResponse verifyFace(String faceDescriptor,
                                       Double threshold);
 AttendanceResponse markAttendanceWithFace(FaceAttendanceRequest request);

 // Utilities
 double calculateSimilarity(String descriptor1, String descriptor2);
 boolean isEnrolled(Long employeeId);
}