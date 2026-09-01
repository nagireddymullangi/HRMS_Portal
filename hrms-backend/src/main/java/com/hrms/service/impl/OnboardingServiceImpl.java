
//service/impl/OnboardingServiceImpl.java
package com.hrms.service.impl;

import com.hrms.exception.ResourceNotFoundException;
import com.hrms.model.*;
import com.hrms.repository.*;
import com.hrms.service.OnboardingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class OnboardingServiceImpl implements OnboardingService {

 private final OnboardingRepository onboardingRepository;
 private final OnboardingTaskRepository taskRepository;
 private final EmployeeRepository employeeRepository;

 @Override
 @Transactional
 public OnboardingProcess initiate(Long employeeId, OnboardingProcess process) {
     Employee emp = employeeRepository.findById(employeeId)
             .orElseThrow(() -> new ResourceNotFoundException(
                 "Employee", "id", employeeId));

     process.setEmployee(emp);
     process.setStatus(OnboardingProcess.Status.INITIATED);
     process.setCompletionPercentage(0);

     OnboardingProcess saved = onboardingRepository.save(process);
     createDefaultTasks(saved);
     return saved;
 }

 @Override
 public OnboardingProcess getById(Long id) {
     return onboardingRepository.findById(id)
             .orElseThrow(() -> new ResourceNotFoundException(
                 "Onboarding", "id", id));
 }

 @Override
 public OnboardingProcess getByEmployee(Long employeeId) {
     return onboardingRepository.findByEmployeeId(employeeId)
             .orElseThrow(() -> new ResourceNotFoundException(
                 "Onboarding", "employeeId", employeeId));
 }

 @Override
 public List<OnboardingProcess> getAll() {
     return onboardingRepository.findAllByOrderByCreatedAtDesc();
 }

 @Override
 @Transactional
 public OnboardingProcess updateStatus(Long id, String status) {
     OnboardingProcess process = getById(id);
     process.setStatus(OnboardingProcess.Status.valueOf(status));
     if (status.equals("COMPLETED")) {
         process.setActualCompletionDate(LocalDate.now());
         process.setCompletionPercentage(100);
     }
     return onboardingRepository.save(process);
 }

 @Override
 @Transactional
 public OnboardingTask addTask(Long onboardingId, OnboardingTask task) {
     OnboardingProcess process = getById(onboardingId);
     task.setOnboarding(process);
     OnboardingTask saved = taskRepository.save(task);
     updateProgress(onboardingId);
     return saved;
 }

 @Override
 @Transactional
 public OnboardingTask updateTask(Long taskId, OnboardingTask task) {
     OnboardingTask existing = taskRepository.findById(taskId)
             .orElseThrow(() -> new ResourceNotFoundException(
                 "Task", "id", taskId));

     existing.setTaskName(task.getTaskName());
     existing.setDescription(task.getDescription());
     existing.setDueDate(task.getDueDate());
     existing.setPriority(task.getPriority());
     existing.setStatus(task.getStatus());

     if (task.getStatus() == OnboardingTask.Status.COMPLETED) {
         existing.setCompletedAt(LocalDateTime.now());
     }

     OnboardingTask updated = taskRepository.save(existing);
     updateProgress(existing.getOnboarding().getId());
     return updated;
 }

 @Override
 @Transactional
 public OnboardingTask completeTask(Long taskId) {
     OnboardingTask task = taskRepository.findById(taskId)
             .orElseThrow(() -> new ResourceNotFoundException(
                 "Task", "id", taskId));
     task.setStatus(OnboardingTask.Status.COMPLETED);
     task.setCompletedAt(LocalDateTime.now());
     OnboardingTask saved = taskRepository.save(task);
     updateProgress(task.getOnboarding().getId());
     return saved;
 }

 @Override
 public void deleteTask(Long taskId) {
     OnboardingTask task = taskRepository.findById(taskId).orElseThrow();
     Long onboardingId = task.getOnboarding().getId();
     taskRepository.deleteById(taskId);
     updateProgress(onboardingId);
 }

 @Override
 public List<OnboardingTask> getTasks(Long onboardingId) {
     return taskRepository.findByOnboardingIdOrderByDueDateAsc(onboardingId);
 }

 @Override
 @Transactional
 public void createDefaultTasks(OnboardingProcess process) {
     String[][] defaultTasks = {
         {"Complete Personal Details Form", "DOCUMENT", "HIGH"},
         {"Submit ID Proof (Aadhaar/PAN)", "DOCUMENT", "HIGH"},
         {"Submit Educational Certificates", "DOCUMENT", "HIGH"},
         {"Submit Previous Experience Letters", "DOCUMENT", "MEDIUM"},
         {"Bank Account Details", "PAPERWORK", "HIGH"},
         {"Sign Employment Contract", "PAPERWORK", "HIGH"},
         {"Sign NDA", "PAPERWORK", "HIGH"},
         {"Office Tour & Introductions", "ORIENTATION", "MEDIUM"},
         {"Setup Email Account", "IT_SETUP", "HIGH"},
         {"Provide Laptop & Equipment", "IT_SETUP", "HIGH"},
         {"Access Card / Badge", "IT_SETUP", "MEDIUM"},
         {"Company Policies Briefing", "ORIENTATION", "MEDIUM"},
         {"Team Introduction", "ORIENTATION", "MEDIUM"},
         {"Assign Mentor/Buddy", "ORIENTATION", "MEDIUM"},
         {"Initial Training Schedule", "TRAINING", "MEDIUM"},
     };

     LocalDate baseDate = process.getStartDate();
     for (int i = 0; i < defaultTasks.length; i++) {
         String[] taskInfo = defaultTasks[i];
         OnboardingTask task = OnboardingTask.builder()
                 .onboarding(process)
                 .taskName(taskInfo[0])
                 .category(OnboardingTask.Category.valueOf(taskInfo[1]))
                 .priority(OnboardingTask.Priority.valueOf(taskInfo[2]))
                 .status(OnboardingTask.Status.PENDING)
                 .isRequired(true)
                 .dueDate(baseDate.plusDays(i / 3))
                 .build();
         taskRepository.save(task);
     }
 }

 @Override
 public Map<String, Object> getStatistics() {
     Map<String, Object> stats = new HashMap<>();
     List<OnboardingProcess> all = onboardingRepository.findAll();
     stats.put("total", all.size());
     stats.put("inProgress", all.stream()
         .filter(p -> p.getStatus() == OnboardingProcess.Status.IN_PROGRESS)
         .count());
     stats.put("completed", all.stream()
         .filter(p -> p.getStatus() == OnboardingProcess.Status.COMPLETED)
         .count());
     stats.put("initiated", all.stream()
         .filter(p -> p.getStatus() == OnboardingProcess.Status.INITIATED)
         .count());
     return stats;
 }

 private void updateProgress(Long onboardingId) {
     List<OnboardingTask> tasks = taskRepository
         .findByOnboardingIdOrderByDueDateAsc(onboardingId);
     if (tasks.isEmpty()) return;

     long completed = tasks.stream()
         .filter(t -> t.getStatus() == OnboardingTask.Status.COMPLETED)
         .count();
     int percentage = (int) ((completed * 100) / tasks.size());

     OnboardingProcess process = onboardingRepository.findById(onboardingId).orElseThrow();
     process.setCompletionPercentage(percentage);

     if (percentage == 100) {
         process.setStatus(OnboardingProcess.Status.COMPLETED);
         process.setActualCompletionDate(LocalDate.now());
     } else if (percentage > 0) {
         process.setStatus(OnboardingProcess.Status.IN_PROGRESS);
     }

     onboardingRepository.save(process);
 }
}