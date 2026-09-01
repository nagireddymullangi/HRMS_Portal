
//service/ProjectService.java
package com.hrms.service;

import com.hrms.dto.response.ProjectResponse;
import com.hrms.model.Project;
import com.hrms.model.ProjectMember;
import com.hrms.model.ProjectTask;

import java.util.List;
import java.util.Map;

public interface ProjectService {
 // Projects
 ProjectResponse createProject(Project project);
 ProjectResponse updateProject(Long id, Project project);
 ProjectResponse getProject(Long id);
 List<ProjectResponse> getAllProjects();
 List<ProjectResponse> getActiveProjects();
 List<ProjectResponse> getProjectsByEmployee(Long employeeId);
 void deleteProject(Long id);
 ProjectResponse updateStatus(Long id, String status);

 // Members
 ProjectMember addMember(Long projectId, Long employeeId, String role);
 void removeMember(Long projectId, Long employeeId);
 List<ProjectMember> getMembers(Long projectId);

 // Tasks
 ProjectTask createTask(Long projectId, ProjectTask task);
 ProjectTask updateTask(Long taskId, ProjectTask task);
 ProjectTask updateTaskStatus(Long taskId, String status);
 List<ProjectTask> getTasksByProject(Long projectId);
 List<ProjectTask> getTasksByEmployee(Long employeeId);
 void deleteTask(Long taskId);

 // Statistics
 Map<String, Object> getStatistics();
}