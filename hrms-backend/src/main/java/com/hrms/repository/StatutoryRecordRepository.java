
//repository/StatutoryRecordRepository.java
package com.hrms.repository;

import com.hrms.model.StatutoryRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StatutoryRecordRepository
     extends JpaRepository<StatutoryRecord, Long> {

 List<StatutoryRecord> findByRecordTypeOrderByPeriodYearDescPeriodMonthDesc(
     StatutoryRecord.RecordType recordType);

 List<StatutoryRecord> findByFilingStatusOrderByCreatedAtDesc(
     StatutoryRecord.FilingStatus status);

 List<StatutoryRecord> findByPeriodYearAndPeriodMonthOrderByRecordType(
     Integer year, Integer month);

 List<StatutoryRecord> findAllByOrderByCreatedAtDesc();

 Long countByFilingStatus(StatutoryRecord.FilingStatus status);
}