
//service/SettlementService.java
package com.hrms.service;

import com.hrms.dto.response.FnFSettlementResponse;
import com.hrms.model.FullFinalSettlement;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

public interface SettlementService {

 FnFSettlementResponse create(FullFinalSettlement settlement);
 FnFSettlementResponse update(Long id, FullFinalSettlement settlement);
 FnFSettlementResponse getById(Long id);
 FnFSettlementResponse getByEmployee(Long employeeId);
 List<FnFSettlementResponse> getAll();
 List<FnFSettlementResponse> getByStatus(String status);

 // Auto-calculate
 Map<String, Object> autoCalculate(Long employeeId);

 // Workflow
 FnFSettlementResponse submitForApproval(Long id);
 FnFSettlementResponse approve(Long id, Long approverId);
 FnFSettlementResponse markPaid(Long id, String paymentReference,
                                  String paymentMode);
 FnFSettlementResponse putOnHold(Long id, String reason);
 void delete(Long id);

 // PDF
 byte[] generatePdf(Long id);

 Map<String, Object> getStatistics();
}