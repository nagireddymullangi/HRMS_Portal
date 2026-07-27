// service/impl/AuthServiceImpl.java
package com.hrms.service.impl;

import com.hrms.dto.request.LoginRequest;
import com.hrms.dto.request.RegisterRequest;
import com.hrms.dto.response.AuthResponse;
import com.hrms.exception.HrmsAPIException;
import com.hrms.exception.ResourceNotFoundException;
import com.hrms.model.Employee;
import com.hrms.model.User;
import com.hrms.repository.EmployeeRepository;
import com.hrms.repository.UserRepository;
import com.hrms.security.JwtTokenProvider;
import com.hrms.service.AuthService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthServiceImpl implements AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final EmployeeRepository employeeRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    @Override
    public AuthResponse login(LoginRequest request) {
        log.info("Login attempt for: {}", request.getUsernameOrEmail());

        // Authenticate
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getUsernameOrEmail(),
                        request.getPassword()
                )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);

        // Generate token
        String token = jwtTokenProvider.generateToken(authentication);

        // Get user
        User user = userRepository
                .findByUsernameOrEmail(
                        request.getUsernameOrEmail(),
                        request.getUsernameOrEmail())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "User", "username", request.getUsernameOrEmail()));

        // Get employee info
        Long employeeId = null;
        String name = "Administrator";

        if (user.getRole() == User.Role.ROLE_EMPLOYEE) {
            // ✅ FIX: Use findByUser_Id instead of findByUserId
            Employee employee = employeeRepository
                    .findByUser_Id(user.getId())
                    .orElse(null);

            if (employee != null) {
                employeeId = employee.getId();
                name = employee.getFullName();
            }
        }

        log.info("Login successful for: {}", user.getUsername());

        return new AuthResponse(
                token,
                user.getRole().name(),
                user.getId(),
                employeeId,
                name,
                user.getEmail(),
                user.getUsername()
        );
    }

    @Override
    @Transactional
    public String register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new HrmsAPIException(HttpStatus.BAD_REQUEST,
                    "Username already exists!");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new HrmsAPIException(HttpStatus.BAD_REQUEST,
                    "Email already exists!");
        }

        User.Role role = User.Role.ROLE_EMPLOYEE;
        if (request.getRole() != null &&
                request.getRole().equalsIgnoreCase("ROLE_ADMIN")) {
            role = User.Role.ROLE_ADMIN;
        }

        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(role)
                .isActive(true)
                .build();

        userRepository.save(user);
        log.info("User registered: {}", request.getUsername());
        return "User registered successfully!";
    }
}