
//service/EmailService.java
package com.hrms.service;

import java.util.Map;

public interface EmailService {

 void sendSimpleEmail(String to, String subject, String body);

 void sendHtmlEmail(String to, String subject, String htmlContent);

 void sendHtmlEmailWithAttachment(
     String to, String subject, String htmlContent,
     byte[] attachment, String attachmentName);

 void sendTemplateEmail(
     String to, String subject, String templateName,
     Map<String, Object> variables);

 void sendOfferLetterEmail(String to, String candidateName,
                            String offerNumber, byte[] pdfAttachment);

 void sendLeaveStatusEmail(String to, String employeeName,
                            String status, String comment,
                            String leaveType, String dates);

 void sendPayslipEmail(String to, String employeeName,
                       String month, String year, byte[] pdfAttachment);

 void sendWelcomeEmail(String to, String employeeName,
                       String username, String password);

 void sendExitConfirmationEmail(String to, String employeeName,
                                 String lastWorkingDate);
}