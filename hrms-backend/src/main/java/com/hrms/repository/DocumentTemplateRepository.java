
//repository/DocumentTemplateRepository.java
package com.hrms.repository;

import com.hrms.model.DocumentTemplate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DocumentTemplateRepository
     extends JpaRepository<DocumentTemplate, Long> {

 List<DocumentTemplate> findByIsActiveTrueOrderByNameAsc();

 List<DocumentTemplate> findByTypeAndIsActiveTrue(
     DocumentTemplate.DocumentType type);

 List<DocumentTemplate> findAllByOrderByCreatedAtDesc();
}