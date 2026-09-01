
//repository/ExpenseCategoryRepository.java
package com.hrms.repository;

import com.hrms.model.ExpenseCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ExpenseCategoryRepository extends JpaRepository<ExpenseCategory, Long> {
 List<ExpenseCategory> findByIsActiveTrue();
 boolean existsByName(String name);
}