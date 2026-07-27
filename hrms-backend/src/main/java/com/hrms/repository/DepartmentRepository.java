
//repository/DepartmentRepository.java
package com.hrms.repository;

import com.hrms.model.Department;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface DepartmentRepository extends JpaRepository<Department, Long> {
 Optional<Department> findByName(String name);
 Boolean existsByName(String name);

 //@Query("SELECT d, COUNT(e) FROM Department d LEFT JOIN d.employees e GROUP BY d")
 //List<Object[]> findDepartmentsWithEmployeeCount();
}