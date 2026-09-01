
//repository/GrievanceCommentRepository.java
package com.hrms.repository;

import com.hrms.model.GrievanceComment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface GrievanceCommentRepository extends JpaRepository<GrievanceComment, Long> {
 List<GrievanceComment> findByGrievanceIdOrderByCreatedAtAsc(Long grievanceId);
}