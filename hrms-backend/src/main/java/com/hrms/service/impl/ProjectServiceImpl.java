
//service/impl/ProjectServiceImpl.java
package com.hrms.service.impl;

import com.hrms.dto.response.ProjectResponse;
import com.hrms.exception.ResourceNotFoundException;
import com.hrms.model.*;
import com.hrms.repository.*;
import com.hrms.service.ProjectService;
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
public class ProjectServiceImpl implements ProjectService {

 private final ProjectRepository projectRepository;
 private final ProjectMemberRepository memberRepository;
 private final ProjectTaskRepository taskRepository;
 private final EmployeeRepository employeeRepository;

 @Override
 @Transactional
 public ProjectResponse createProject(Project project) {
     if (project.getProjectCode() == null) {
         project.setProjectCode(generateProjectCode());
     }
     Project saved = projectRepository.save(project);
     return mapToResponse(saved);
 }

 @Override
 @Transactional
 public ProjectResponse updateProject(Long id, Project project) {
     Project existing = projectRepository.findById(id)
             .orElseThrow(() -> new ResourceNotFoundException(
                 "Project", "id", id));

     existing.setName(project.getName());
     existing.setDescription(project.getDescription());
     existing.setClientName(project.getClientName());
     existing.setStartDate(project.getStartDate());
     existing.setEndDate(project.getEndDate());
     existing.setEstimatedHours(project.getEstimatedHours());
     existing.setBudget(project.getBudget());
     existing.setStatus(project.getStatus());
     existing.setPriority(project.getPriority());
     existing.setColor(project.getColor());
     existing.setIsBillable(project.getIsBillable());
     existing.setHourlyRate(project.getHourlyRate());
     existing.setProjectManagerId(project.getProjectManagerId());

     return mapToResponse(projectRepository.save(existing));
 }

 @Override
 public ProjectResponse getProject(Long id) {
     Project project = projectRepository.findById(id)
             .orElseThrow(() -> new ResourceNotFoundException(
                 "Project", "id", id));
     return mapToResponse(project);
 }

 @Override
 public List<ProjectResponse> getAllProjects() {
     return projectRepository.findAllByOrderByCreatedAtDesc()
             .stream()
             .map(this::mapToResponse)
             .collect(Collectors.toList());
 }

 @Override
 public List<ProjectResponse> getActiveProjects() {
     return projectRepository.findByStatus(Project.Status.ACTIVE)
             .stream()
             .map(this::mapToResponse)
             .collect(Collectors.toList());
 }

 @Override
 public List<ProjectResponse> getProjectsByEmployee(Long employeeId) {
     return projectRepository.findByEmployeeId(employeeId)
             .stream()
             .map(this::mapToResponse)
             .collect(Collectors.toList());
 }

 @Override
 public void deleteProject(Long id) {
     projectRepository.deleteById(id);
 }

 @Override
 @Transactional
 public ProjectResponse updateStatus(Long id, String status) {
     Project project = projectRepository.findById(id)
             .orElseThrow(() -> new ResourceNotFoundException(
                 "Project", "id", id));
     project.setStatus(Project.Status.valueOf(status));
     return mapToResponse(projectRepository.save(project));
 }

 @Override
 @Transactional
 public ProjectMember addMember(Long projectId, Long employeeId, String role) {
     Project project = projectRepository.findById(projectId)
             .orElseThrow(() -> new ResourceNotFoundException(
                 "Project", "id", projectId));
     Employee employee = employeeRepository.findById(employeeId)
             .orElseThrow(() -> new ResourceNotFoundException(
                 "Employee", "id", employeeId));

     ProjectMember member = memberRepository
             .findByProjectIdAndEmployeeId(projectId, employeeId)
             .orElse(ProjectMember.builder()
                 .project(project)
                 .employee(employee)
                 .role(role)
                 .assignedDate(LocalDate.now())
                 .isActive(true)
                 .build());

     member.setRole(role);
     member.setIsActive(true);
     return memberRepository.save(member);
 }

 @Override
 @Transactional
 public void removeMember(Long projectId, Long employeeId) {
     memberRepository.deleteByProjectIdAndEmployeeId(projectId, employeeId);
 }

 @Override
 public List<ProjectMember> getMembers(Long projectId) {
     return memberRepository.findByProjectId(projectId);
 }

 @Override
 @Transactional
 public ProjectTask createTask(Long projectId, ProjectTask task) {
     Project project = projectRepository.findById(projectId)
             .orElseThrow(() -> new ResourceNotFoundException(
                 "Project", "id", projectId));
     task.setProject(project);
     return taskRepository.save(task);
 }

 @Override
 @Transactional
 public ProjectTask updateTask(Long taskId, ProjectTask task) {
     ProjectTask existing = taskRepository.findById(taskId)
             .orElseThrow(() -> new ResourceNotFoundException(
                 "Task", "id", taskId));

     existing.setTaskName(task.getTaskName());
     existing.setDescription(task.getDescription());
     existing.setAssignedTo(task.getAssignedTo());
     existing.setPriority(task.getPriority());
     existing.setStatus(task.getStatus());
     existing.setEstimatedHours(task.getEstimatedHours());
     existing.setStartDate(task.getStartDate());
     existing.setDueDate(task.getDueDate());

     if (task.getStatus() == ProjectTask.Status.DONE) {
         existing.setCompletedDate(LocalDate.now());
     }

     return taskRepository.save(existing);
 }

 @Override
 @Transactional
 public ProjectTask updateTaskStatus(Long taskId, String status) {
     ProjectTask task = taskRepository.findById(taskId)
             .orElseThrow(() -> new ResourceNotFoundException(
                 "Task", "id", taskId));
     task.setStatus(ProjectTask.Status.valueOf(status));
     if (status.equals("DONE")) {
         task.setCompletedDate(LocalDate.now());
     }
     return taskRepository.save(task);
 }

 @Override
 public List<ProjectTask> getTasksByProject(Long projectId) {
     return taskRepository.findByProjectIdOrderByCreatedAtDesc(projectId);
 }

 @Override
 public List<ProjectTask> getTasksByEmployee(Long employeeId) {
     return taskRepository.findByAssignedToOrderByDueDateAsc(employeeId);
 }

 @Override
 public void deleteTask(Long taskId) {
     taskRepository.deleteById(taskId);
 }

 @Override
 public Map<String, Object> getStatistics() {
     Map<String, Object> stats = new HashMap<>();
     stats.put("totalProjects", projectRepository.count());
     stats.put("activeProjects",
         projectRepository.countByStatus(Project.Status.ACTIVE));
     stats.put("completedProjects",
         projectRepository.countByStatus(Project.Status.COMPLETED));
     stats.put("onHoldProjects",
         projectRepository.countByStatus(Project.Status.ON_HOLD));
     return stats;
 }

 private String generateProjectCode() {
     long count = projectRepository.count() + 1;
     return String.format("PRJ-%d-%04d", LocalDate.now().getYear(), count);
 }

 private ProjectResponse mapToResponse(Project p) {
     List<ProjectMember> members = memberRepository.findByProjectId(p.getId());
     List<ProjectTask> tasks = taskRepository
             .findByProjectIdOrderByCreatedAtDesc(p.getId());

     long completedTasks = tasks.stream()
             .filter(t -> t.getStatus() == ProjectTask.Status.DONE)
             .count();

     double progress = tasks.isEmpty() ? 0
             : (completedTasks * 100.0) / tasks.size();

     String managerName = "Not Assigned";
     if (p.getProjectManagerId() != null) {
         managerName = employeeRepository.findById(p.getProjectManagerId())
                 .map(Employee::getFullName)
                 .orElse("Unknown");
     }

     return ProjectResponse.builder()
             .id(p.getId())
             .projectCode(p.getProjectCode())
             .name(p.getName())
             .description(p.getDescription())
             .clientName(p.getClientName())
             .projectManagerId(p.getProjectManagerId())
             .projectManagerName(managerName)
             .startDate(p.getStartDate())
             .endDate(p.getEndDate())
             .estimatedHours(p.getEstimatedHours())
             .actualHours(p.getActualHours())
             .budget(p.getBudget())
             .status(p.getStatus().name())
             .priority(p.getPriority().name())
             .color(p.getColor())
             .isBillable(p.getIsBillable())
             .hourlyRate(p.getHourlyRate())
             .totalMembers(members.size())
             .totalTasks(tasks.size())
             .completedTasks((int) completedTasks)
             .progressPercentage(Math.round(progress * 100.0) / 100.0)
             .createdAt(p.getCreatedAt())
             .build();
 }
}