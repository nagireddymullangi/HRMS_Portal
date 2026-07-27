
//repository/GeneratedDocumentRepository.java
package com.hrms.repository;

import com.hrms.model.GeneratedDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GeneratedDocumentRepository
     extends JpaRepository<GeneratedDocument, Long> {

 List<GeneratedDocument> findByEmployeeIdOrderByGeneratedAtDesc(Long employeeId);

 List<GeneratedDocument> findAllByOrderByGeneratedAtDesc();
}