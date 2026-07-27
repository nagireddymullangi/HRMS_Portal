
//service/LeaveService.java
package com.hrms.service;

import com.hrms.dto.request.LeaveRequest;
import com.hrms.dto.request.LeaveStatusRequest;
import com.hrms.dto.response.LeaveResponse;
import java.util.List;

public interface LeaveService {
 LeaveResponse applyLeave(Long employeeId, LeaveRequest request);
 LeaveResponse getLeaveById(Long id);
 List<LeaveResponse> getLeavesByEmployee(Long employeeId);
 List<LeaveResponse> getAllLeaves();
 List<LeaveResponse> getPendingLeaves();
 LeaveResponse updateLeaveStatus(Long id, LeaveStatusRequest request);
 void deleteLeave(Long id);
 List<Object> getLeaveTypes();
}