
//repository/ProjectTaskRepository.java
package com.hrms.repository;

import com.hrms.model.ProjectTask;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ProjectTaskRepository extends JpaRepository<ProjectTask, Long> {
 List<ProjectTask> findByProjectIdOrderByCreatedAtDesc(Long projectId);
 List<ProjectTask> findByAssignedToOrderByDueDateAsc(Long assignedTo);
 List<ProjectTask> findByProjectIdAndStatus(Long projectId,
                                              ProjectTask.Status status);
}