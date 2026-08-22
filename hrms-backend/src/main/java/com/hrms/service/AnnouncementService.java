
//service/AnnouncementService.java
package com.hrms.service;

import com.hrms.dto.request.AnnouncementRequest;
import com.hrms.dto.response.AnnouncementResponse;

import java.util.List;

public interface AnnouncementService {
 AnnouncementResponse create(AnnouncementRequest request, Long userId);
 AnnouncementResponse update(Long id, AnnouncementRequest request);
 AnnouncementResponse getById(Long id, Long employeeId);
 List<AnnouncementResponse> getAll();
 List<AnnouncementResponse> getForEmployee(Long employeeId);
 void delete(Long id);
 void markAsRead(Long announcementId, Long employeeId);
 void togglePin(Long id);
 void toggleActive(Long id);
}