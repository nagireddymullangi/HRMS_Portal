
//service/ComplianceService.java
package com.hrms.service;

import com.hrms.model.ComplianceEvent;
import com.hrms.model.StatutoryRecord;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

public interface ComplianceService {

 // Statutory Records
 StatutoryRecord createRecord(StatutoryRecord record);
 StatutoryRecord updateRecord(Long id, StatutoryRecord record);
 StatutoryRecord getRecord(Long id);
 List<StatutoryRecord> getAllRecords();
 List<StatutoryRecord> getRecordsByType(String type);
 List<StatutoryRecord> getRecordsByPeriod(Integer year, Integer month);
 List<StatutoryRecord> getRecordsByStatus(String status);
 void deleteRecord(Long id);

 StatutoryRecord markFiled(Long id, String acknowledgmentNumber);
 StatutoryRecord markPaid(Long id, String challanNumber);

 // Compliance Events
 ComplianceEvent createEvent(ComplianceEvent event);
 ComplianceEvent updateEvent(Long id, ComplianceEvent event);
 ComplianceEvent getEvent(Long id);
 List<ComplianceEvent> getAllEvents();
 List<ComplianceEvent> getUpcomingEvents(int days);
 List<ComplianceEvent> getOverdueEvents();
 ComplianceEvent completeEvent(Long id, String notes);
 void deleteEvent(Long id);

 // Analytics
 Map<String, Object> getDashboardStats();
 Map<String, Object> getComplianceReport(Integer year);
}