
//service/impl/PerformanceServiceImpl.java
package com.hrms.service.impl;

import com.hrms.exception.ResourceNotFoundException;
import com.hrms.model.EmployeeKra;
import com.hrms.model.PerformanceCycle;
import com.hrms.repository.EmployeeKraRepository;
import com.hrms.repository.PerformanceCycleRepository;
import com.hrms.service.PerformanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
@RequiredArgsConstructor
public class PerformanceServiceImpl implements PerformanceService {

 private final PerformanceCycleRepository cycleRepository;
 private final EmployeeKraRepository kraRepository;

 @Override
 public PerformanceCycle createCycle(PerformanceCycle cycle) {
     return cycleRepository.save(cycle);
 }

 @Override
 public List<PerformanceCycle> getAllCycles() {
     return cycleRepository.findAllByOrderByStartDateDesc();
 }

 @Override
 public PerformanceCycle updateCycleStatus(Long id, String status) {
     PerformanceCycle cycle = cycleRepository.findById(id)
             .orElseThrow(() -> new ResourceNotFoundException(
                 "Cycle", "id", id));
     cycle.setStatus(PerformanceCycle.Status.valueOf(status));
     return cycleRepository.save(cycle);
 }

 @Override
 public EmployeeKra createKra(EmployeeKra kra) {
     return kraRepository.save(kra);
 }

 @Override
 public List<EmployeeKra> getEmployeeKras(Long employeeId, Long cycleId) {
     return kraRepository.findByEmployeeIdAndCycleId(employeeId, cycleId);
 }

 @Override
 @Transactional
 public EmployeeKra updateKra(Long id, EmployeeKra kra) {
     EmployeeKra existing = kraRepository.findById(id)
             .orElseThrow(() -> new ResourceNotFoundException(
                 "KRA", "id", id));
     existing.setTitle(kra.getTitle());
     existing.setDescription(kra.getDescription());
     existing.setWeightage(kra.getWeightage());
     existing.setTarget(kra.getTarget());
     return kraRepository.save(existing);
 }

 @Override
 @Transactional
 public EmployeeKra submitSelfReview(Long id, Integer rating,
                                       String comments) {
     EmployeeKra kra = kraRepository.findById(id)
             .orElseThrow(() -> new ResourceNotFoundException(
                 "KRA", "id", id));
     kra.setSelfRating(rating);
     kra.setSelfComments(comments);
     kra.setStatus(EmployeeKra.Status.SELF_REVIEW);
     return kraRepository.save(kra);
 }

 @Override
 @Transactional
 public EmployeeKra submitManagerReview(Long id, Integer rating,
                                          String comments) {
     EmployeeKra kra = kraRepository.findById(id)
             .orElseThrow(() -> new ResourceNotFoundException(
                 "KRA", "id", id));
     kra.setManagerRating(rating);
     kra.setManagerComments(comments);
     kra.setFinalRating(rating);
     kra.setStatus(EmployeeKra.Status.COMPLETED);
     return kraRepository.save(kra);
 }

 @Override
 public Map<String, Object> getEmployeePerformanceSummary(
         Long employeeId, Long cycleId) {
     List<EmployeeKra> kras = kraRepository
             .findByEmployeeIdAndCycleId(employeeId, cycleId);

     Map<String, Object> summary = new HashMap<>();
     summary.put("totalKras", kras.size());

     double totalWeightedRating = 0;
     int totalWeightage = 0;

     for (EmployeeKra kra : kras) {
         if (kra.getFinalRating() != null && kra.getWeightage() != null) {
             totalWeightedRating += kra.getFinalRating() * kra.getWeightage();
             totalWeightage += kra.getWeightage();
         }
     }

     double overallRating = totalWeightage > 0 ?
             totalWeightedRating / totalWeightage : 0;

     summary.put("overallRating", Math.round(overallRating * 100.0) / 100.0);
     summary.put("kras", kras);

     String grade = "N/A";
     if (overallRating >= 4.5) grade = "Excellent";
     else if (overallRating >= 3.5) grade = "Good";
     else if (overallRating >= 2.5) grade = "Average";
     else if (overallRating > 0) grade = "Needs Improvement";
     summary.put("grade", grade);

     return summary;
 }
}