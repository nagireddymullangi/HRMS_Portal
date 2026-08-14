
//repository/ESignatureRepository.java
package com.hrms.repository;

import com.hrms.model.ESignature;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface ESignatureRepository extends JpaRepository<ESignature, Long> {
 Optional<ESignature> findByVerificationToken(String token);
 List<ESignature> findByDocumentIdAndDocumentType(Long docId, String type);
 List<ESignature> findAllByOrderByCreatedAtDesc();
}