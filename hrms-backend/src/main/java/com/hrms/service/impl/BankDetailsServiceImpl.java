
//service/impl/BankDetailsServiceImpl.java
package com.hrms.service.impl;

import com.hrms.exception.ResourceNotFoundException;
import com.hrms.model.BankDetails;
import com.hrms.model.Employee;
import com.hrms.repository.BankDetailsRepository;
import com.hrms.repository.EmployeeRepository;
import com.hrms.service.BankDetailsService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BankDetailsServiceImpl implements BankDetailsService {

 private final BankDetailsRepository repository;
 private final EmployeeRepository employeeRepository;

 @Override
 @Transactional
 public BankDetails createOrUpdate(Long employeeId, BankDetails details) {
     Employee emp = employeeRepository.findById(employeeId)
             .orElseThrow(() -> new ResourceNotFoundException(
                 "Employee", "id", employeeId));

     BankDetails existing = repository.findByEmployeeId(employeeId)
             .orElse(new BankDetails());

     existing.setEmployee(emp);
     existing.setAccountHolderName(details.getAccountHolderName());
     existing.setBankName(details.getBankName());
     existing.setBranchName(details.getBranchName());
     existing.setAccountNumber(details.getAccountNumber());
     existing.setIfscCode(details.getIfscCode());
     existing.setAccountType(details.getAccountType());
     existing.setIsVerified(false);

     return repository.save(existing);
 }

 @Override
 public BankDetails getByEmployeeId(Long employeeId) {
     return repository.findByEmployeeId(employeeId)
             .orElseThrow(() -> new ResourceNotFoundException(
                 "BankDetails", "employeeId", employeeId));
 }

 @Override
 public List<BankDetails> getAll() {
     return repository.findAll();
 }

 @Override
 @Transactional
 public BankDetails verify(Long id) {
     BankDetails details = repository.findById(id)
             .orElseThrow(() -> new ResourceNotFoundException(
                 "BankDetails", "id", id));
     details.setIsVerified(true);
     details.setVerifiedAt(LocalDateTime.now());
     return repository.save(details);
 }

 @Override
 public void delete(Long id) {
     repository.deleteById(id);
 }
}