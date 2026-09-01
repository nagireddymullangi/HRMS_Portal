
//repository/FullFinalSettlementRepository.java
package com.hrms.repository;

import com.hrms.model.FullFinalSettlement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FullFinalSettlementRepository
     extends JpaRepository<FullFinalSettlement, Long> {

 Optional<FullFinalSettlement> findByEmployeeId(Long employeeId);

 List<FullFinalSettlement> findByStatusOrderByCreatedAtDesc(
     FullFinalSettlement.Status status);

 List<FullFinalSettlement> findAllByOrderByCreatedAtDesc();

 Long countByStatus(FullFinalSettlement.Status status);
}