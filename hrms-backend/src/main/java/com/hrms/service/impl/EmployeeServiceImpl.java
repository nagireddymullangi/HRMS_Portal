// service/impl/EmployeeServiceImpl.java
package com.hrms.service.impl;

import com.hrms.dto.request.EmployeeRequest;
import com.hrms.dto.response.EmployeeResponse;
import com.hrms.exception.HrmsAPIException;
import com.hrms.exception.ResourceNotFoundException;
import com.hrms.model.Department;
import com.hrms.model.Employee;
import com.hrms.model.User;
import com.hrms.repository.DepartmentRepository;
import com.hrms.repository.EmployeeRepository;
import com.hrms.repository.UserRepository;
import com.hrms.service.EmailService;
import com.hrms.service.EmployeeService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmployeeServiceImpl implements EmployeeService {

    private final EmployeeRepository employeeRepository;
    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    @Override
    @Transactional
    public EmployeeResponse createEmployee(EmployeeRequest request) {
        if (employeeRepository.existsByEmail(request.getEmail())) {
            throw new HrmsAPIException(HttpStatus.BAD_REQUEST,
                    "Email already exists");
        }
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new HrmsAPIException(HttpStatus.BAD_REQUEST,
                    "Username already exists");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new HrmsAPIException(HttpStatus.BAD_REQUEST,
                    "Email already registered");
        }

        // Create User Account
        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(User.Role.ROLE_EMPLOYEE)
                .isActive(true)
                .build();
        user = userRepository.save(user);

        // Get Department
        Department department = null;
        if (request.getDepartmentId() != null) {
            department = departmentRepository
                    .findById(request.getDepartmentId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Department", "id", request.getDepartmentId()));
        }

        // Create Employee
        Employee employee = Employee.builder()
                .employeeId(generateEmployeeId())
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .dateOfBirth(request.getDateOfBirth())
                .dateOfJoining(request.getDateOfJoining())
                .designation(request.getDesignation())
                .department(department)
                .address(request.getAddress())
                .status(Employee.Status.ACTIVE)
                .user(user)
                .build();

        Employee saved = employeeRepository.save(employee);
        try {
            emailService.sendWelcomeEmail(
                saved.getEmail(),
                saved.getFullName(),
                request.getUsername(),
                request.getPassword()
            );
        } catch (Exception e) {
            log.error("Failed to send welcome email", e);
        }
        log.info("Employee created: {}", saved.getEmployeeId());
        return mapToResponse(saved);
        
        
    }

    @Override
    public EmployeeResponse getEmployeeById(Long id) {
        Employee emp = employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Employee", "id", id));
        return mapToResponse(emp);
    }

    @Override
    public EmployeeResponse getEmployeeByUserId(Long userId) {
        // ✅ FIX: Use findByUser_Id
        Employee emp = employeeRepository.findByUser_Id(userId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Employee", "userId", userId));
        return mapToResponse(emp);
    }

    @Override
    public List<EmployeeResponse> getAllEmployees() {
        return employeeRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public EmployeeResponse updateEmployee(Long id, EmployeeRequest request) {
        Employee emp = employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Employee", "id", id));

        Department department = null;
        if (request.getDepartmentId() != null) {
            department = departmentRepository
                    .findById(request.getDepartmentId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Department", "id", request.getDepartmentId()));
        }

        emp.setFirstName(request.getFirstName());
        emp.setLastName(request.getLastName());
        emp.setPhone(request.getPhone());
        emp.setDateOfBirth(request.getDateOfBirth());
        emp.setDateOfJoining(request.getDateOfJoining());
        emp.setDesignation(request.getDesignation());
        emp.setDepartment(department);
        emp.setAddress(request.getAddress());

        if (request.getStatus() != null && !request.getStatus().isEmpty()) {
            emp.setStatus(Employee.Status.valueOf(request.getStatus()));
        }

        Employee updated = employeeRepository.save(emp);
        return mapToResponse(updated);
    }

    @Override
    @Transactional
    public void deleteEmployee(Long id) {
        Employee emp = employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Employee", "id", id));
        employeeRepository.delete(emp);
        log.info("Employee deleted: {}", id);
    }

    @Override
    public List<EmployeeResponse> searchEmployees(String keyword) {
        String lk = keyword.toLowerCase();
        return employeeRepository.findAll()
                .stream()
                .filter(e ->
                    e.getFirstName().toLowerCase().contains(lk) ||
                    e.getLastName().toLowerCase().contains(lk) ||
                    e.getEmail().toLowerCase().contains(lk) ||
                    e.getEmployeeId().toLowerCase().contains(lk) ||
                    (e.getDepartment() != null &&
                     e.getDepartment().getName().toLowerCase().contains(lk))
                )
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public String generateEmployeeId() {
        long count = employeeRepository.count() + 1;
        return String.format("PTS%04d", count);
    }

    public EmployeeResponse mapToResponse(Employee emp) {
        return EmployeeResponse.builder()
                .id(emp.getId())
                .employeeId(emp.getEmployeeId())
                .firstName(emp.getFirstName())
                .lastName(emp.getLastName())
                .fullName(emp.getFullName())
                .email(emp.getEmail())
                .phone(emp.getPhone())
                .dateOfBirth(emp.getDateOfBirth())
                .dateOfJoining(emp.getDateOfJoining())
                .designation(emp.getDesignation())
                .departmentId(emp.getDepartment() != null ?
                        emp.getDepartment().getId() : null)
                .departmentName(emp.getDepartment() != null ?
                        emp.getDepartment().getName() : null)
                .status(emp.getStatus().name())
                .address(emp.getAddress())
                // ✅ FIX: Use helper methods from Employee model
                .userId(emp.getUserId())
                .username(emp.getUsername())
                .createdAt(emp.getCreatedAt())
                .build();
    }
}