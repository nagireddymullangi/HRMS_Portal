
//service/PerformanceService.java
package com.hrms.service;

import com.hrms.model.EmployeeKra;
import com.hrms.model.PerformanceCycle;
import java.util.List;
import java.util.Map;

public interface PerformanceService {
 PerformanceCycle createCycle(PerformanceCycle cycle);
 List<PerformanceCycle> getAllCycles();
 PerformanceCycle updateCycleStatus(Long id, String status);

 EmployeeKra createKra(EmployeeKra kra);
 List<EmployeeKra> getEmployeeKras(Long employeeId, Long cycleId);
 EmployeeKra updateKra(Long id, EmployeeKra kra);
 EmployeeKra submitSelfReview(Long id, Integer rating, String comments);
 EmployeeKra submitManagerReview(Long id, Integer rating, String comments);

 Map<String, Object> getEmployeePerformanceSummary(Long employeeId, Long cycleId);
}