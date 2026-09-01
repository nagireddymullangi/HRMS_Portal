
//service/impl/ComplianceServiceImpl.java
package com.hrms.service.impl;

import com.hrms.exception.ResourceNotFoundException;
import com.hrms.model.*;
import com.hrms.repository.*;
import com.hrms.service.ComplianceService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ComplianceServiceImpl implements ComplianceService {

 private final StatutoryRecordRepository recordRepository;
 private final ComplianceEventRepository eventRepository;

 @Override
 @Transactional
 public StatutoryRecord createRecord(StatutoryRecord record) {
     if (record.getReferenceNumber() == null) {
         record.setReferenceNumber(generateReferenceNumber(record.getRecordType()));
     }

     // Auto-calculate total
     record.setTotalAmount(
         record.getEmployerContribution().add(record.getEmployeeContribution()));

     return recordRepository.save(record);
 }

 @Override
 @Transactional
 public StatutoryRecord updateRecord(Long id, StatutoryRecord record) {
     StatutoryRecord existing = recordRepository.findById(id)
             .orElseThrow(() -> new ResourceNotFoundException(
                 "Record", "id", id));

     existing.setAmount(record.getAmount());
     existing.setEmployerContribution(record.getEmployerContribution());
     existing.setEmployeeContribution(record.getEmployeeContribution());
     existing.setTotalAmount(
         record.getEmployerContribution().add(record.getEmployeeContribution()));
     existing.setFilingStatus(record.getFilingStatus());
     existing.setNotes(record.getNotes());
     existing.setDocumentUrl(record.getDocumentUrl());

     return recordRepository.save(existing);
 }

 @Override
 public StatutoryRecord getRecord(Long id) {
     return recordRepository.findById(id)
             .orElseThrow(() -> new ResourceNotFoundException(
                 "Record", "id", id));
 }

 @Override
 public List<StatutoryRecord> getAllRecords() {
     return recordRepository.findAllByOrderByCreatedAtDesc();
 }

 @Override
 public List<StatutoryRecord> getRecordsByType(String type) {
     return recordRepository
             .findByRecordTypeOrderByPeriodYearDescPeriodMonthDesc(
                 StatutoryRecord.RecordType.valueOf(type));
 }

 @Override
 public List<StatutoryRecord> getRecordsByPeriod(Integer year, Integer month) {
     return recordRepository
             .findByPeriodYearAndPeriodMonthOrderByRecordType(year, month);
 }

 @Override
 public List<StatutoryRecord> getRecordsByStatus(String status) {
     return recordRepository.findByFilingStatusOrderByCreatedAtDesc(
         StatutoryRecord.FilingStatus.valueOf(status));
 }

 @Override
 public void deleteRecord(Long id) {
     recordRepository.deleteById(id);
 }

 @Override
 @Transactional
 public StatutoryRecord markFiled(Long id, String acknowledgmentNumber) {
     StatutoryRecord record = recordRepository.findById(id)
             .orElseThrow(() -> new ResourceNotFoundException(
                 "Record", "id", id));

     record.setFilingStatus(StatutoryRecord.FilingStatus.FILED);
     record.setAcknowledgmentNumber(acknowledgmentNumber);
     record.setFilingDate(LocalDate.now());
     return recordRepository.save(record);
 }

 @Override
 @Transactional
 public StatutoryRecord markPaid(Long id, String challanNumber) {
     StatutoryRecord record = recordRepository.findById(id)
             .orElseThrow(() -> new ResourceNotFoundException(
                 "Record", "id", id));

     record.setFilingStatus(StatutoryRecord.FilingStatus.PAID);
     record.setChallanNumber(challanNumber);
     record.setPaymentDate(LocalDate.now());
     return recordRepository.save(record);
 }

 @Override
 @Transactional
 public ComplianceEvent createEvent(ComplianceEvent event) {
     return eventRepository.save(event);
 }

 @Override
 @Transactional
 public ComplianceEvent updateEvent(Long id, ComplianceEvent event) {
     ComplianceEvent existing = eventRepository.findById(id)
             .orElseThrow(() -> new ResourceNotFoundException(
                 "Event", "id", id));

     existing.setTitle(event.getTitle());
     existing.setDescription(event.getDescription());
     existing.setComplianceType(event.getComplianceType());
     existing.setDueDate(event.getDueDate());
     existing.setFrequency(event.getFrequency());
     existing.setReminderDaysBefore(event.getReminderDaysBefore());
     existing.setStatus(event.getStatus());
     existing.setIsActive(event.getIsActive());

     return eventRepository.save(existing);
 }

 @Override
 public ComplianceEvent getEvent(Long id) {
     return eventRepository.findById(id)
             .orElseThrow(() -> new ResourceNotFoundException(
                 "Event", "id", id));
 }

 @Override
 public List<ComplianceEvent> getAllEvents() {
     List<ComplianceEvent> events = eventRepository
         .findByIsActiveTrueOrderByDueDateAsc();

     // Mark as overdue
     events.forEach(e -> {
         if (e.isOverdue()) {
             e.setStatus(ComplianceEvent.Status.OVERDUE);
             eventRepository.save(e);
         }
     });

     return events;
 }

 @Override
 public List<ComplianceEvent> getUpcomingEvents(int days) {
     LocalDate today = LocalDate.now();
     return eventRepository.findUpcoming(today, today.plusDays(days));
 }

 @Override
 public List<ComplianceEvent> getOverdueEvents() {
     return eventRepository.findOverdue(LocalDate.now());
 }

 @Override
 @Transactional
 public ComplianceEvent completeEvent(Long id, String notes) {
     ComplianceEvent event = eventRepository.findById(id)
             .orElseThrow(() -> new ResourceNotFoundException(
                 "Event", "id", id));

     event.setStatus(ComplianceEvent.Status.COMPLETED);
     event.setCompletedDate(LocalDate.now());
     event.setCompletionNotes(notes);

     ComplianceEvent saved = eventRepository.save(event);

     // Auto-create next occurrence if recurring
     if (event.getFrequency() != ComplianceEvent.Frequency.ONE_TIME) {
         createRecurringEvent(event);
     }

     return saved;
 }

 private void createRecurringEvent(ComplianceEvent original) {
     LocalDate nextDate;
     switch (original.getFrequency()) {
         case MONTHLY: nextDate = original.getDueDate().plusMonths(1); break;
         case QUARTERLY: nextDate = original.getDueDate().plusMonths(3); break;
         case HALF_YEARLY: nextDate = original.getDueDate().plusMonths(6); break;
         case ANNUALLY: nextDate = original.getDueDate().plusYears(1); break;
         default: return;
     }

     ComplianceEvent next = ComplianceEvent.builder()
             .title(original.getTitle())
             .description(original.getDescription())
             .complianceType(original.getComplianceType())
             .dueDate(nextDate)
             .frequency(original.getFrequency())
             .reminderDaysBefore(original.getReminderDaysBefore())
             .status(ComplianceEvent.Status.PENDING)
             .isActive(true)
             .build();

     eventRepository.save(next);
 }

 @Override
 public void deleteEvent(Long id) {
     eventRepository.deleteById(id);
 }

 @Override
 public Map<String, Object> getDashboardStats() {
     Map<String, Object> stats = new HashMap<>();

     // Statutory records
     stats.put("totalRecords", recordRepository.count());
     stats.put("pendingRecords", recordRepository.countByFilingStatus(
         StatutoryRecord.FilingStatus.PENDING));
     stats.put("filedRecords", recordRepository.countByFilingStatus(
         StatutoryRecord.FilingStatus.FILED));
     stats.put("paidRecords", recordRepository.countByFilingStatus(
         StatutoryRecord.FilingStatus.PAID));

     // Compliance events
     stats.put("totalEvents", eventRepository.count());
     stats.put("overdueEvents", eventRepository.countByStatus(
         ComplianceEvent.Status.OVERDUE));
     stats.put("upcomingEvents", getUpcomingEvents(30).size());
     stats.put("completedEvents", eventRepository.countByStatus(
         ComplianceEvent.Status.COMPLETED));

     return stats;
 }

 @Override
 public Map<String, Object> getComplianceReport(Integer year) {
     Map<String, Object> report = new HashMap<>();

     List<StatutoryRecord> yearlyRecords = recordRepository
             .findAllByOrderByCreatedAtDesc()
             .stream()
             .filter(r -> Objects.equals(r.getPeriodYear(), year))
             .collect(Collectors.toList());

     Map<String, BigDecimal> byType = new HashMap<>();
     for (StatutoryRecord.RecordType type : StatutoryRecord.RecordType.values()) {
         BigDecimal total = yearlyRecords.stream()
                 .filter(r -> r.getRecordType() == type)
                 .map(StatutoryRecord::getTotalAmount)
                 .reduce(BigDecimal.ZERO, BigDecimal::add);
         byType.put(type.name(), total);
     }

     report.put("year", year);
     report.put("totalRecords", yearlyRecords.size());
     report.put("byType", byType);
     report.put("totalAmount", yearlyRecords.stream()
             .map(StatutoryRecord::getTotalAmount)
             .reduce(BigDecimal.ZERO, BigDecimal::add));

     return report;
 }

 private String generateReferenceNumber(StatutoryRecord.RecordType type) {
     long count = recordRepository.count() + 1;
     return String.format("%s-%d-%05d",
         type.name(), LocalDate.now().getYear(), count);
 }
}