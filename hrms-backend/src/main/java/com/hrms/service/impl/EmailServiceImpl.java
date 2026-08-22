
//service/impl/EmailServiceImpl.java
package com.hrms.service.impl;

import com.hrms.service.EmailService;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import java.io.UnsupportedEncodingException;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailServiceImpl implements EmailService {

 private final JavaMailSender mailSender;
 private final TemplateEngine templateEngine;

 @Value("${app.mail.from}")
 private String fromEmail;

 @Value("${app.mail.from-name}")
 private String fromName;

 @Value("${app.mail.enabled}")
 private boolean emailEnabled;

 @Value("${app.company.name}")
 private String companyName;

 @Value("${app.frontend.url}")
 private String frontendUrl;

 @Override
 @Async
 public void sendSimpleEmail(String to, String subject, String body) {
     if (!emailEnabled) {
         log.info("Email disabled. Would send to: {}", to);
         return;
     }
     try {
         SimpleMailMessage message = new SimpleMailMessage();
         message.setFrom(fromEmail);
         message.setTo(to);
         message.setSubject(subject);
         message.setText(body);
         mailSender.send(message);
         log.info("Email sent to: {}", to);
     } catch (Exception e) {
         log.error("Failed to send email to {}: {}", to, e.getMessage());
     }
 }

 @Override
 @Async
 public void sendHtmlEmail(String to, String subject, String htmlContent) {
     if (!emailEnabled) {
         log.info("Email disabled. Would send HTML to: {}", to);
         return;
     }
     try {
         MimeMessage message = mailSender.createMimeMessage();
         MimeMessageHelper helper = new MimeMessageHelper(
             message, true, "UTF-8");

         helper.setFrom(fromEmail, fromName);
         helper.setTo(to);
         helper.setSubject(subject);
         helper.setText(htmlContent, true);

         mailSender.send(message);
         log.info("HTML email sent to: {}", to);
     } catch (MessagingException | UnsupportedEncodingException e) {
         log.error("Failed to send HTML email: {}", e.getMessage());
     }
 }

 @Override
 @Async
 public void sendHtmlEmailWithAttachment(
         String to, String subject, String htmlContent,
         byte[] attachment, String attachmentName) {

     if (!emailEnabled) {
         log.info("Email disabled. Would send with attachment to: {}", to);
         return;
     }

     try {
         MimeMessage message = mailSender.createMimeMessage();
         MimeMessageHelper helper = new MimeMessageHelper(
             message, true, "UTF-8");

         helper.setFrom(fromEmail, fromName);
         helper.setTo(to);
         helper.setSubject(subject);
         helper.setText(htmlContent, true);

         if (attachment != null && attachment.length > 0) {
             helper.addAttachment(attachmentName,
                 new ByteArrayResource(attachment));
         }

         mailSender.send(message);
         log.info("Email with attachment sent to: {}", to);
     } catch (Exception e) {
         log.error("Failed to send email with attachment: {}", e.getMessage());
     }
 }

 @Override
 @Async
 public void sendTemplateEmail(String to, String subject,
                                 String templateName,
                                 Map<String, Object> variables) {
     Context context = new Context();
     variables.forEach(context::setVariable);
     context.setVariable("companyName", companyName);
     context.setVariable("frontendUrl", frontendUrl);

     String htmlContent = templateEngine.process(templateName, context);
     sendHtmlEmail(to, subject, htmlContent);
 }

 @Override
 public void sendOfferLetterEmail(String to, String candidateName,
                                    String offerNumber,
                                    byte[] pdfAttachment) {
     Map<String, Object> vars = new HashMap<>();
     vars.put("candidateName", candidateName);
     vars.put("offerNumber", offerNumber);

     Context context = new Context();
     vars.forEach(context::setVariable);
     context.setVariable("companyName", companyName);

     String html = templateEngine.process("email/offer-letter", context);

     sendHtmlEmailWithAttachment(
         to,
         "🎉 Job Offer from " + companyName,
         html,
         pdfAttachment,
         "Offer_Letter_" + offerNumber + ".pdf"
     );
 }

 @Override
 public void sendLeaveStatusEmail(String to, String employeeName,
                                    String status, String comment,
                                    String leaveType, String dates) {
     Map<String, Object> vars = new HashMap<>();
     vars.put("employeeName", employeeName);
     vars.put("status", status);
     vars.put("comment", comment != null ? comment : "");
     vars.put("leaveType", leaveType);
     vars.put("dates", dates);
     vars.put("statusColor", "APPROVED".equals(status) ? "#10b981" : "#ef4444");

     sendTemplateEmail(
         to,
         "Leave Application " + status,
         "email/leave-status",
         vars
     );
 }

 @Override
 public void sendPayslipEmail(String to, String employeeName,
                                String month, String year,
                                byte[] pdfAttachment) {
     Map<String, Object> vars = new HashMap<>();
     vars.put("employeeName", employeeName);
     vars.put("month", month);
     vars.put("year", year);

     Context context = new Context();
     vars.forEach(context::setVariable);
     context.setVariable("companyName", companyName);

     String html = templateEngine.process("email/payslip", context);

     sendHtmlEmailWithAttachment(
         to,
         "💰 Payslip for " + month + " " + year,
         html,
         pdfAttachment,
         "Payslip_" + month + "_" + year + ".pdf"
     );
 }

 @Override
 public void sendWelcomeEmail(String to, String employeeName,
                                String username, String password) {
     Map<String, Object> vars = new HashMap<>();
     vars.put("employeeName", employeeName);
     vars.put("username", username);
     vars.put("password", password);

     sendTemplateEmail(
         to,
         "🎉 Welcome to " + companyName,
         "email/welcome",
         vars
     );
 }

 @Override
 public void sendExitConfirmationEmail(String to, String employeeName,
                                         String lastWorkingDate) {
     Map<String, Object> vars = new HashMap<>();
     vars.put("employeeName", employeeName);
     vars.put("lastWorkingDate", lastWorkingDate);

     sendTemplateEmail(
         to,
         "Exit Process Initiated",
         "email/exit-confirmation",
         vars
     );
 }
 
//service/impl/EmailServiceImpl.java - Add these implementations

 @Override
 public void sendPasswordResetEmail(String to, String userName,
                                      String resetLink, int expiryMinutes) {

     // If emails are disabled, log the reset link to the console for testing
     if (!emailEnabled) {
         log.info("=================================================");
         log.info("📧 [DEV MODE] PASSWORD RESET LINK FOR: {}", to);
         log.info("🔗 RESET LINK: {}", resetLink);
         log.info("=================================================");
         return;
     }

     try {
         Map<String, Object> vars = new HashMap<>();
         vars.put("userName", userName);
         vars.put("resetLink", resetLink);
         vars.put("expiryMinutes", expiryMinutes);

         sendTemplateEmail(
             to,
             "🔐 Password Reset Request - " + companyName,
             "email/password-reset",
             vars
         );
     } catch (Exception e) {
         log.error("Failed to send password reset email to {}: {}", to, e.getMessage());
         // Log link to console as a fallback so testing isn't blocked
         log.info("=================================================");
         log.info("📧 [FALLBACK] PASSWORD RESET LINK FOR: {}", to);
         log.info("🔗 RESET LINK: {}", resetLink);
         log.info("=================================================");
     }
 }
@Override
public void sendPasswordChangedEmail(String to, String userName) {
  Map<String, Object> vars = new HashMap<>();
  vars.put("userName", userName);
  vars.put("timestamp", java.time.LocalDateTime.now()
      .format(java.time.format.DateTimeFormatter
          .ofPattern("dd MMM yyyy, hh:mm a")));

  sendTemplateEmail(
      to,
      "✅ Password Changed Successfully - " + companyName,
      "email/password-changed",
      vars
  );
}
}