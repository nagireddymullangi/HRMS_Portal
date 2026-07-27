// repository/EmployeeRepository.java
package com.hrms.repository;

import com.hrms.model.Employee;
import com.hrms.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EmployeeRepository extends JpaRepository<Employee, Long> {

    // ✅ FIX: Use user.id navigation instead of userId
    Optional<Employee> findByUser_Id(Long userId);

    // Alternative with @Query (also works)
    @Query("SELECT e FROM Employee e WHERE e.user.id = :userId")
    Optional<Employee> findByUserId(@Param("userId") Long userId);

    Optional<Employee> findByEmail(String email);

    Boolean existsByEmail(String email);

    Boolean existsByEmployeeId(String employeeId);

    List<Employee> findByDepartmentId(Long departmentId);

    List<Employee> findByStatus(Employee.Status status);

    @Query("SELECT COUNT(e) FROM Employee e WHERE e.status = 'ACTIVE'")
    Long countActiveEmployees();
}