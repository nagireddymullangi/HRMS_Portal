
//repository/LeaveTypeRepository.java
package com.hrms.repository;

import com.hrms.model.LeaveType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface LeaveTypeRepository extends JpaRepository<LeaveType, Long> {
 boolean existsByName(String name);
}