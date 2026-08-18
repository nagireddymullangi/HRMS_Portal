
//repository/AttendanceVerificationLogRepository.java
package com.hrms.repository;

import com.hrms.model.AttendanceVerificationLog;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AttendanceVerificationLogRepository
     extends JpaRepository<AttendanceVerificationLog, Long> {
 List<AttendanceVerificationLog> findByEmployeeIdOrderByAttemptedAtDesc(
     Long employeeId);
 List<AttendanceVerificationLog> findAllByOrderByAttemptedAtDesc();
}