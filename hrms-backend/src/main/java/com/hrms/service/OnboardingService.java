
//service/OnboardingService.java
package com.hrms.service;

import com.hrms.model.OnboardingProcess;
import com.hrms.model.OnboardingTask;
import java.util.List;
import java.util.Map;

public interface OnboardingService {
 OnboardingProcess initiate(Long employeeId, OnboardingProcess process);
 OnboardingProcess getById(Long id);
 OnboardingProcess getByEmployee(Long employeeId);
 List<OnboardingProcess> getAll();
 OnboardingProcess updateStatus(Long id, String status);

 // Tasks
 OnboardingTask addTask(Long onboardingId, OnboardingTask task);
 OnboardingTask updateTask(Long taskId, OnboardingTask task);
 OnboardingTask completeTask(Long taskId);
 void deleteTask(Long taskId);
 List<OnboardingTask> getTasks(Long onboardingId);

 // Templates - Create default tasks
 void createDefaultTasks(OnboardingProcess process);

 Map<String, Object> getStatistics();
}