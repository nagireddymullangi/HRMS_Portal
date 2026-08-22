
//service/impl/AnnouncementServiceImpl.java
package com.hrms.service.impl;

import com.hrms.dto.request.AnnouncementRequest;
import com.hrms.dto.response.AnnouncementResponse;
import com.hrms.exception.ResourceNotFoundException;
import com.hrms.model.*;
import com.hrms.repository.*;
import com.hrms.service.AnnouncementService;
import com.hrms.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AnnouncementServiceImpl implements AnnouncementService {

 private final AnnouncementRepository announcementRepository;
 private final AnnouncementReadRepository readRepository;
 private final DepartmentRepository departmentRepository;
 private final EmployeeRepository employeeRepository;
 private final UserRepository userRepository;
 private final NotificationService notificationService;

 @Override
 @Transactional
 public AnnouncementResponse create(AnnouncementRequest request, Long userId) {
     Department dept = null;
     if (request.getDepartmentId() != null) {
         dept = departmentRepository.findById(request.getDepartmentId())
                 .orElseThrow(() -> new ResourceNotFoundException(
                     "Department", "id", request.getDepartmentId()));
     }

     Announcement announcement = Announcement.builder()
             .title(request.getTitle())
             .content(request.getContent())
             .priority(request.getPriority() != null
                 ? Announcement.Priority.valueOf(request.getPriority())
                 : Announcement.Priority.MEDIUM)
             .category(request.getCategory() != null
                 ? request.getCategory() : "GENERAL")
             .targetAudience(request.getTargetAudience() != null
                 ? Announcement.TargetAudience.valueOf(request.getTargetAudience())
                 : Announcement.TargetAudience.ALL)
             .department(dept)
             .attachmentUrl(request.getAttachmentUrl())
             .isPinned(request.getIsPinned() != null
                 ? request.getIsPinned() : false)
             .isActive(true)
             .publishDate(request.getPublishDate() != null
                 ? request.getPublishDate() : LocalDateTime.now())
             .expiryDate(request.getExpiryDate())
             .createdBy(userId)
             .build();

     // Set target employees if SPECIFIC
     if (request.getTargetAudience() != null &&
         request.getTargetAudience().equals("SPECIFIC") &&
         request.getTargetEmployeeIds() != null) {
         Set<Employee> targets = request.getTargetEmployeeIds().stream()
                 .map(id -> employeeRepository.findById(id).orElse(null))
                 .filter(Objects::nonNull)
                 .collect(Collectors.toSet());
         announcement.setTargetEmployees(targets);
     }

     Announcement saved = announcementRepository.save(announcement);

     // Send notifications to relevant employees
     sendNotifications(saved);

     return mapToResponse(saved, null);
 }

 private void sendNotifications(Announcement announcement) {
     try {
         List<Employee> recipients = getRecipients(announcement);

         for (Employee emp : recipients) {
             if (emp.getUser() != null) {
                 notificationService.createNotification(
                     emp.getUser().getId(),
                     "📢 New Announcement",
                     announcement.getTitle(),
                     Notification.NotificationType.ANNOUNCEMENT,
                     announcement.getId(),
                     "ANNOUNCEMENT",
                     "/employee/announcements/" + announcement.getId(),
                     "megaphone",
                     Notification.Priority.valueOf(
                         announcement.getPriority().name())
                 );
             }
         }
     } catch (Exception e) {
         log.error("Failed to send notifications", e);
     }
 }

 private List<Employee> getRecipients(Announcement announcement) {
     switch (announcement.getTargetAudience()) {
         case ALL:
             return employeeRepository.findAll();
         case DEPARTMENT:
             if (announcement.getDepartment() != null) {
                 return employeeRepository
                     .findByDepartmentId(announcement.getDepartment().getId());
             }
             return new ArrayList<>();
         case SPECIFIC:
             return new ArrayList<>(announcement.getTargetEmployees());
         default:
             return new ArrayList<>();
     }
 }

 @Override
 @Transactional
 public AnnouncementResponse update(Long id, AnnouncementRequest request) {
     Announcement announcement = announcementRepository.findById(id)
             .orElseThrow(() -> new ResourceNotFoundException(
                 "Announcement", "id", id));

     announcement.setTitle(request.getTitle());
     announcement.setContent(request.getContent());

     if (request.getPriority() != null) {
         announcement.setPriority(
             Announcement.Priority.valueOf(request.getPriority()));
     }
     if (request.getCategory() != null) {
         announcement.setCategory(request.getCategory());
     }
     if (request.getExpiryDate() != null) {
         announcement.setExpiryDate(request.getExpiryDate());
     }
     if (request.getAttachmentUrl() != null) {
         announcement.setAttachmentUrl(request.getAttachmentUrl());
     }

     return mapToResponse(announcementRepository.save(announcement), null);
 }

 @Override
 @Transactional
 public AnnouncementResponse getById(Long id, Long employeeId) {
     Announcement announcement = announcementRepository.findById(id)
             .orElseThrow(() -> new ResourceNotFoundException(
                 "Announcement", "id", id));

     // Increment view count
     announcementRepository.incrementViewCount(id);

     // Auto-mark as read
     if (employeeId != null) {
         markAsRead(id, employeeId);
     }

     return mapToResponse(announcement, employeeId);
 }

 @Override
 public List<AnnouncementResponse> getAll() {
     return announcementRepository.findAllByOrderByCreatedAtDesc()
             .stream()
             .map(a -> mapToResponse(a, null))
             .collect(Collectors.toList());
 }

 @Override
 public List<AnnouncementResponse> getForEmployee(Long employeeId) {
     Employee emp = employeeRepository.findById(employeeId)
             .orElseThrow(() -> new ResourceNotFoundException(
                 "Employee", "id", employeeId));

     Long deptId = emp.getDepartment() != null
         ? emp.getDepartment().getId() : null;

     return announcementRepository
             .findForEmployee(employeeId, deptId, LocalDateTime.now())
             .stream()
             .map(a -> mapToResponse(a, employeeId))
             .collect(Collectors.toList());
 }

 @Override
 public void delete(Long id) {
     announcementRepository.deleteById(id);
 }

 @Override
 @Transactional
 public void markAsRead(Long announcementId, Long employeeId) {
     if (!readRepository.existsByAnnouncementIdAndEmployeeId(
             announcementId, employeeId)) {
         Employee emp = employeeRepository.findById(employeeId)
                 .orElseThrow(() -> new ResourceNotFoundException(
                     "Employee", "id", employeeId));
         Announcement announcement = announcementRepository
                 .findById(announcementId)
                 .orElseThrow(() -> new ResourceNotFoundException(
                     "Announcement", "id", announcementId));

         AnnouncementRead read = AnnouncementRead.builder()
                 .announcement(announcement)
                 .employee(emp)
                 .build();
         readRepository.save(read);
     }
 }

 @Override
 @Transactional
 public void togglePin(Long id) {
     Announcement a = announcementRepository.findById(id)
             .orElseThrow(() -> new ResourceNotFoundException(
                 "Announcement", "id", id));
     a.setIsPinned(!a.getIsPinned());
     announcementRepository.save(a);
 }

 @Override
 @Transactional
 public void toggleActive(Long id) {
     Announcement a = announcementRepository.findById(id)
             .orElseThrow(() -> new ResourceNotFoundException(
                 "Announcement", "id", id));
     a.setIsActive(!a.getIsActive());
     announcementRepository.save(a);
 }

 private AnnouncementResponse mapToResponse(Announcement a, Long employeeId) {
     String createdByName = "Unknown";
     try {
         User user = userRepository.findById(a.getCreatedBy()).orElse(null);
         if (user != null) {
             Employee emp = employeeRepository
                 .findByUser_Id(user.getId()).orElse(null);
             createdByName = emp != null ? emp.getFullName() : user.getUsername();
         }
     } catch (Exception e) {
         log.warn("Could not fetch creator name", e);
     }

     Long readCount = readRepository.countByAnnouncementId(a.getId());

     Boolean isRead = false;
     if (employeeId != null) {
         isRead = readRepository.existsByAnnouncementIdAndEmployeeId(
             a.getId(), employeeId);
     }

     return AnnouncementResponse.builder()
             .id(a.getId())
             .title(a.getTitle())
             .content(a.getContent())
             .priority(a.getPriority().name())
             .category(a.getCategory())
             .targetAudience(a.getTargetAudience().name())
             .departmentId(a.getDepartment() != null
                 ? a.getDepartment().getId() : null)
             .departmentName(a.getDepartment() != null
                 ? a.getDepartment().getName() : null)
             .attachmentUrl(a.getAttachmentUrl())
             .isActive(a.getIsActive())
             .isPinned(a.getIsPinned())
             .publishDate(a.getPublishDate())
             .expiryDate(a.getExpiryDate())
             .createdBy(a.getCreatedBy())
             .createdByName(createdByName)
             .viewCount(a.getViewCount())
             .readCount(readCount)
             .isRead(isRead)
             .targetEmployeeIds(a.getTargetEmployees().stream()
                 .map(Employee::getId).collect(Collectors.toSet()))
             .createdAt(a.getCreatedAt())
             .updatedAt(a.getUpdatedAt())
             .build();
 }
}