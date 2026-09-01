
//repository/ExpenseClaimRepository.java
package com.hrms.repository;

import com.hrms.model.ExpenseClaim;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface ExpenseClaimRepository extends JpaRepository<ExpenseClaim, Long> {

 List<ExpenseClaim> findByEmployeeIdOrderByExpenseDateDesc(Long employeeId);

 List<ExpenseClaim> findByStatusOrderByCreatedAtDesc(ExpenseClaim.Status status);

 List<ExpenseClaim> findAllByOrderByCreatedAtDesc();

 @Query("SELECT SUM(e.amount) FROM ExpenseClaim e " +
        "WHERE e.employee.id = :empId " +
        "AND e.status = 'APPROVED' " +
        "AND e.expenseDate BETWEEN :start AND :end")
 BigDecimal sumApprovedByEmployeeAndDateRange(
     @Param("empId") Long empId,
     @Param("start") LocalDate start,
     @Param("end") LocalDate end);

 @Query("SELECT COUNT(e) FROM ExpenseClaim e WHERE e.status = :status")
 Long countByStatus(@Param("status") ExpenseClaim.Status status);

 @Query("SELECT SUM(e.amount) FROM ExpenseClaim e WHERE e.status = :status")
 BigDecimal sumByStatus(@Param("status") ExpenseClaim.Status status);
}