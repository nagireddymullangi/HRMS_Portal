
//service/NotificationService.java
package com.hrms.service;

public interface NotificationService {
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