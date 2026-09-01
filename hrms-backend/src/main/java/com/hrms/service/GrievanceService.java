
//service/GrievanceService.java
package com.hrms.service;

import com.hrms.dto.response.GrievanceResponse;
import com.hrms.model.Grievance;
import com.hrms.model.GrievanceComment;

import java.util.List;
import java.util.Map;

public interface GrievanceService {
 GrievanceResponse create(Grievance grievance);
 GrievanceResponse getById(Long id);
 List<GrievanceResponse> getAll();
 List<GrievanceResponse> getByEmployee(Long employeeId);
 List<GrievanceResponse> getByStatus(String status);
 List<GrievanceResponse> getMyAssigned(Long userId);

 GrievanceResponse updateStatus(Long id, String status);
 GrievanceResponse assign(Long id, Long userId);
 GrievanceResponse resolve(Long id, String resolution, Long userId);
 GrievanceResponse escalate(Long id);
 GrievanceResponse submitFeedback(Long id, Integer rating, String feedback);

 GrievanceComment addComment(Long grievanceId, Long userId,
                               String comment, Boolean isInternal);
 List<GrievanceComment> getComments(Long grievanceId);

 Map<String, Object> getStatistics();
}