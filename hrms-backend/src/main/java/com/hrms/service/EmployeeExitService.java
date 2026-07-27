
//service/EmployeeExitService.java
package com.hrms.service;

import com.hrms.dto.request.EmployeeExitRequest;
import com.hrms.dto.request.ExitUpdateRequest;
import com.hrms.dto.response.EmployeeExitResponse;

import java.util.List;

public interface EmployeeExitService {
 EmployeeExitResponse initiate(EmployeeExitRequest request);
 EmployeeExitResponse getById(Long id);
 List<EmployeeExitResponse> getAll();
 List<EmployeeExitResponse> getByEmployee(Long employeeId);
 EmployeeExitResponse update(Long id, ExitUpdateRequest request);
 EmployeeExitResponse approveExit(Long id);
 void cancel(Long id);
}