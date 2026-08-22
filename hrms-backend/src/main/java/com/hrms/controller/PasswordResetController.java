
//controller/PasswordResetController.java
package com.hrms.controller;

import com.hrms.dto.request.ChangePasswordRequest;
import com.hrms.dto.request.ForgotPasswordRequest;
import com.hrms.dto.request.ResetPasswordRequest;
import com.hrms.dto.response.ApiResponse;
import com.hrms.service.PasswordResetService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class PasswordResetController {

 private final PasswordResetService passwordResetService;

 /**
  * POST /api/auth/forgot-password
  * Public endpoint - anyone can request password reset
  */
 @PostMapping("/forgot-password")
 public ResponseEntity<ApiResponse<Map<String, Object>>> forgotPassword(
         @Valid @RequestBody ForgotPasswordRequest request,
         HttpServletRequest httpRequest) {

     String ipAddress = getClientIp(httpRequest);
     String userAgent = httpRequest.getHeader("User-Agent");

     Map<String, Object> result = passwordResetService
         .forgotPassword(request, ipAddress, userAgent);

     return ResponseEntity.ok(ApiResponse.success(
         (String) result.get("message"), result));
 }

 /**
  * GET /api/auth/validate-reset-token?token=xxx
  * Public endpoint - validate token before showing reset form
  */
 @GetMapping("/validate-reset-token")
 public ResponseEntity<ApiResponse<Map<String, Object>>> validateToken(
         @RequestParam String token) {

     Map<String, Object> result = passwordResetService.validateToken(token);
     return ResponseEntity.ok(ApiResponse.success(
         "Token is valid", result));
 }

 /**
  * POST /api/auth/reset-password
  * Public endpoint - reset password with valid token
  */
 @PostMapping("/reset-password")
 public ResponseEntity<ApiResponse<Map<String, Object>>> resetPassword(
         @Valid @RequestBody ResetPasswordRequest request) {

     Map<String, Object> result = passwordResetService
         .resetPassword(request);
     return ResponseEntity.ok(ApiResponse.success(
         (String) result.get("message"), result));
 }

 /**
  * POST /api/auth/change-password
  * Authenticated endpoint - change password when logged in
  */
 @PostMapping("/change-password")
 @PreAuthorize("hasAnyRole('ADMIN','EMPLOYEE')")
 public ResponseEntity<ApiResponse<Map<String, Object>>> changePassword(
         @Valid @RequestBody ChangePasswordRequest request,
         Authentication authentication) {

     String username = authentication.getName();
     Map<String, Object> result = passwordResetService
         .changePassword(username, request);
     return ResponseEntity.ok(ApiResponse.success(
         (String) result.get("message"), result));
 }

 /**
  * Get client IP address (handles proxies)
  */
 private String getClientIp(HttpServletRequest request) {
     String ip = request.getHeader("X-Forwarded-For");
     if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
         ip = request.getHeader("X-Real-IP");
     }
     if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
         ip = request.getRemoteAddr();
     }
     // Handle multiple IPs in X-Forwarded-For
     if (ip != null && ip.contains(",")) {
         ip = ip.split(",")[0].trim();
     }
     return ip;
 }
}