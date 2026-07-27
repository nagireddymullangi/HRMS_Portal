//service/AuthService.java
package com.hrms.service;

import com.hrms.dto.request.LoginRequest;
import com.hrms.dto.request.RegisterRequest;
import com.hrms.dto.response.AuthResponse;

public interface AuthService {
 AuthResponse login(LoginRequest request);
 String register(RegisterRequest request);
}