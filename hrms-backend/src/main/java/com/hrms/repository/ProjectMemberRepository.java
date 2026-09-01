
//repository/ProjectMemberRepository.java
package com.hrms.repository;

import com.hrms.model.ProjectMember;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface ProjectMemberRepository extends JpaRepository<ProjectMember, Long> {
 List<ProjectMember> findByProjectId(Long projectId);
 List<ProjectMember> findByEmployeeIdAndIsActiveTrue(Long employeeId);
 Optional<ProjectMember> findByProjectIdAndEmployeeId(
     Long projectId, Long employeeId);
 void deleteByProjectIdAndEmployeeId(Long projectId, Long employeeId);
}