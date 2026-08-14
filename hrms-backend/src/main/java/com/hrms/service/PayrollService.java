
//service/PayrollService.java
package com.hrms.service;

import com.hrms.dto.request.PayrollRequest;
import com.hrms.dto.response.PayrollResponse;
import java.util.List;

public interface PayrollService {
 PayrollResponse generatePayroll(PayrollRequest request);
 PayrollResponse getPayrollById(Long id);
 List<PayrollResponse> getPayrollByEmployee(Long employeeId);
 List<PayrollResponse> getAllPayroll();
 List<PayrollResponse> getPayrollByMonthAndYear(int month, int year);
 PayrollResponse updatePayroll(Long id, PayrollRequest request);
 PayrollResponse markAsPaid(Long id);
 void deletePayroll(Long id);
 byte[] downloadPayslipPdf(Long id);
}