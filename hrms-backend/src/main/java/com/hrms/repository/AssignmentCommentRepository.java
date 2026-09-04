package com.hrms.repository;

import com.hrms.model.AssignmentComment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AssignmentCommentRepository extends JpaRepository<AssignmentComment, Long> {
    List<AssignmentComment> findByAssignmentIdOrderByCreatedAtDesc(Long assignmentId);
}