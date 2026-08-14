
//repository/OvertimeRecordRepository.java
package com.hrms.repository;

import com.hrms.model.OvertimeRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface OvertimeRecordRepository extends JpaRepository<OvertimeRecord, Long> {
List<OvertimeRecord> findByEmployeeIdOrderByDateDesc(Long employeeId);
List<OvertimeRecord> findByStatusOrderByCreatedAtDesc(OvertimeRecord.Status status);
List<OvertimeRecord> findAllByOrderByCreatedAtDesc();
}