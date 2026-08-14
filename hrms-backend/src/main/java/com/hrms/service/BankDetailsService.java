
//service/BankDetailsService.java
package com.hrms.service;

import com.hrms.model.BankDetails;
import java.util.List;

public interface BankDetailsService {
 BankDetails createOrUpdate(Long employeeId, BankDetails details);
 BankDetails getByEmployeeId(Long employeeId);
 List<BankDetails> getAll();
 BankDetails verify(Long id);
 void delete(Long id);
}