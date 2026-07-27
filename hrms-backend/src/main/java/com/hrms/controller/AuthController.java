//controller/AuthController.java
package com.hrms.controller;

import com.hrms.dto.request.LoginRequest;
import com.hrms.dto.request.RegisterRequest;
import com.hrms.dto.response.ApiResponse;
import com.hrms.dto.response.AuthResponse;
import com.hrms.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

 private final AuthService authService;

 // POST /api/auth/login
 @PostMapping("/login")
 public ResponseEntity<ApiResponse<AuthResponse>> login(
         @Valid @RequestBody LoginRequest request) {

     AuthResponse authResponse = authService.login(request);
     return ResponseEntity.ok(
             ApiResponse.success("Login successful", authResponse));
 }

 // POST /api/auth/register (Admin only)
 @PostMapping("/register")
 @PreAuthorize("hasRole('ADMIN')")
 public ResponseEntity<ApiResponse<String>> register(
         @Valid @RequestBody RegisterRequest request) {

     String result = authService.register(request);
     return new ResponseEntity<>(
             ApiResponse.success(result), HttpStatus.CREATED);
 }

 // GET /api/auth/me
 @GetMapping("/me")
 public ResponseEntity<ApiResponse<String>> getCurrentUser() {
     return ResponseEntity.ok(
             ApiResponse.success("Authenticated successfully"));
 }
}