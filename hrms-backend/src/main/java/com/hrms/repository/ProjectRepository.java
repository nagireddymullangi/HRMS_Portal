
//repository/ProjectRepository.java
package com.hrms.repository;

import com.hrms.model.Project;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {
 List<Project> findByStatus(Project.Status status);
 List<Project> findAllByOrderByCreatedAtDesc();
 Long countByStatus(Project.Status status);

 @Query("SELECT p FROM Project p WHERE p.id IN " +
        "(SELECT pm.project.id FROM ProjectMember pm WHERE pm.employee.id = :empId)")
 List<Project> findByEmployeeId(Long empId);
}