
//repository/PayrollRepository.java
package com.hrms.repository;

import com.hrms.model.Payroll;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface PayrollRepository extends JpaRepository<Payroll, Long> {

 List<Payroll> findByEmployeeIdOrderByYearDescMonthDesc(Long employeeId);

 List<Payroll> findByMonthAndYearOrderByEmployeeFirstNameAsc(
     int month, int year);

 Optional<Payroll> findByEmployeeIdAndMonthAndYear(
     Long employeeId, int month, int year);

 boolean existsByEmployeeIdAndMonthAndYear(
     Long employeeId, int month, int year);

 @Query("SELECT SUM(p.netSalary) FROM Payroll p WHERE p.month = :month " +
        "AND p.year = :year")
 BigDecimal sumNetSalaryByMonthAndYear(
     @Param("month") int month,
     @Param("year") int year);

 List<Payroll> findAllByOrderByYearDescMonthDesc();
}