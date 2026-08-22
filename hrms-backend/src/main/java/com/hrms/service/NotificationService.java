
//service/NotificationService.java
package com.hrms.service;

import com.hrms.dto.response.NotificationResponse;
import com.hrms.model.Notification;

import java.util.List;
import java.util.Map;

public interface NotificationService {
	
	void createNotification(Long userId, String title, String message,
            Notification.NotificationType type,
            Long referenceId, String referenceType,
            String actionUrl, String icon,
            Notification.Priority priority);

List<NotificationResponse> getRecent(Long userId);
List<NotificationResponse> getAll(Long userId, int page, int size);
Long getUnreadCount(Long userId);
void markAsRead(Long notificationId);
void markAllAsRead(Long userId);
void deleteNotification(Long id);
void deleteAllRead(Long userId);

 void sendSlackNotification(String message);
 void sendSlackNotification(String message, String channel);
 void sendTeamsNotification(String title, String message, String color);

 // Preset notifications
 void notifyLeaveApproved(String employeeName, String dates);
 void notifyLeaveRejected(String employeeName, String reason);
 void notifyNewEmployee(String employeeName, String department);
 void notifyEmployeeExit(String employeeName, String lastWorkingDate);
 void notifyPayrollGenerated(String month, String year, int count);
}