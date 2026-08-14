
//service/impl/NotificationServiceImpl.java
package com.hrms.service.impl;

import com.hrms.service.NotificationService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Service
@Slf4j
public class NotificationServiceImpl implements NotificationService {

 @Value("${app.slack.enabled}")
 private boolean slackEnabled;

 @Value("${app.slack.webhook-url}")
 private String slackWebhookUrl;

 @Value("${app.slack.default-channel}")
 private String slackChannel;

 @Value("${app.teams.enabled}")
 private boolean teamsEnabled;

 @Value("${app.teams.webhook-url}")
 private String teamsWebhookUrl;

 private final RestTemplate restTemplate = new RestTemplate();

 @Override
 @Async
 public void sendSlackNotification(String message) {
     sendSlackNotification(message, slackChannel);
 }

 @Override
 @Async
 public void sendSlackNotification(String message, String channel) {
     if (!slackEnabled) {
         log.info("Slack disabled. Would send: {}", message);
         return;
     }

     try {
         Map<String, Object> payload = new HashMap<>();
         payload.put("channel", channel);
         payload.put("username", "HRMS Bot");
         payload.put("icon_emoji", ":briefcase:");
         payload.put("text", message);

         HttpHeaders headers = new HttpHeaders();
         headers.setContentType(MediaType.APPLICATION_JSON);

         HttpEntity<Map<String, Object>> request = new HttpEntity<>(
             payload, headers);
         restTemplate.postForEntity(slackWebhookUrl, request, String.class);

         log.info("Slack notification sent");
     } catch (Exception e) {
         log.error("Failed to send Slack notification: {}", e.getMessage());
     }
 }

 @Override
 @Async
 public void sendTeamsNotification(String title, String message,
                                     String color) {
     if (!teamsEnabled) {
         log.info("Teams disabled. Would send: {}", message);
         return;
     }

     try {
         Map<String, Object> payload = new HashMap<>();
         payload.put("@type", "MessageCard");
         payload.put("@context", "https://schema.org/extensions");
         payload.put("themeColor", color != null ? color : "0076D7");
         payload.put("summary", title);
         payload.put("title", title);
         payload.put("text", message);

         HttpHeaders headers = new HttpHeaders();
         headers.setContentType(MediaType.APPLICATION_JSON);

         HttpEntity<Map<String, Object>> request = new HttpEntity<>(
             payload, headers);
         restTemplate.postForEntity(teamsWebhookUrl, request, String.class);

         log.info("Teams notification sent");
     } catch (Exception e) {
         log.error("Failed to send Teams notification: {}", e.getMessage());
     }
 }

 @Override
 public void notifyLeaveApproved(String employeeName, String dates) {
     String message = String.format(
         "✅ *Leave Approved*\n👤 Employee: %s\n📅 Dates: %s",
         employeeName, dates);
     sendSlackNotification(message);
     sendTeamsNotification("Leave Approved", message, "10b981");
 }

 @Override
 public void notifyLeaveRejected(String employeeName, String reason) {
     String message = String.format(
         "❌ *Leave Rejected*\n👤 Employee: %s\n📝 Reason: %s",
         employeeName, reason);
     sendSlackNotification(message);
     sendTeamsNotification("Leave Rejected", message, "ef4444");
 }

 @Override
 public void notifyNewEmployee(String employeeName, String department) {
     String message = String.format(
         "🎉 *New Employee Joined!*\n👤 %s\n🏢 Department: %s",
         employeeName, department);
     sendSlackNotification(message);
     sendTeamsNotification("New Employee", message, "3b82f6");
 }

 @Override
 public void notifyEmployeeExit(String employeeName,
                                  String lastWorkingDate) {
     String message = String.format(
         "👋 *Employee Exit Initiated*\n👤 %s\n📅 Last Working Day: %s",
         employeeName, lastWorkingDate);
     sendSlackNotification(message);
     sendTeamsNotification("Employee Exit", message, "f59e0b");
 }

 @Override
 public void notifyPayrollGenerated(String month, String year, int count) {
     String message = String.format(
         "💰 *Payroll Generated*\n📅 %s %s\n👥 Total employees: %d",
         month, year, count);
     sendSlackNotification(message);
     sendTeamsNotification("Payroll Generated", message, "10b981");
 }
}