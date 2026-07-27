
//service/EmployeeService.java
package com.hrms.service;

import com.hrms.dto.request.EmployeeRequest;
import com.hrms.dto.response.EmployeeResponse;
import java.util.List;

public interface EmployeeService {
 EmployeeResponse createEmployee(EmployeeRequest request);
 EmployeeResponse getEmployeeById(Long id);
 EmployeeResponse getEmployeeByUserId(Long userId);
 List<EmployeeResponse> getAllEmployees();
 EmployeeResponse updateEmployee(Long id, EmployeeRequest request);
 void deleteEmployee(Long id);
 List<EmployeeResponse> searchEmployees(String keyword);
 String generateEmployeeId();
}