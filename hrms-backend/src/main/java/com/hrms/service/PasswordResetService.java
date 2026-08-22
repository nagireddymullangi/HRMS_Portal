
//service/PasswordResetService.java
package com.hrms.service;

import com.hrms.dto.request.ChangePasswordRequest;
import com.hrms.dto.request.ForgotPasswordRequest;
import com.hrms.dto.request.ResetPasswordRequest;

import java.util.Map;

public interface PasswordResetService {

 Map<String, Object> forgotPassword(ForgotPasswordRequest request,
                                     String ipAddress, String userAgent);

 Map<String, Object> validateToken(String token);

 Map<String, Object> resetPassword(ResetPasswordRequest request);

 Map<String, Object> changePassword(String username,
                                     ChangePasswordRequest request);
}