
//service/impl/ESignatureServiceImpl.java
package com.hrms.service.impl;

import com.hrms.exception.ResourceNotFoundException;
import com.hrms.model.ESignature;
import com.hrms.repository.ESignatureRepository;
import com.hrms.service.ESignatureService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ESignatureServiceImpl implements ESignatureService {

 private final ESignatureRepository repository;

 @Override
 @Transactional
 public ESignature requestSignature(ESignature signature) {
     signature.setVerificationToken(UUID.randomUUID().toString());
     signature.setStatus(ESignature.Status.PENDING);
     return repository.save(signature);
 }

 @Override
 @Transactional
 public ESignature signDocument(String token, String signatureData,
                                  String ipAddress, String userAgent) {
     ESignature signature = repository.findByVerificationToken(token)
             .orElseThrow(() -> new ResourceNotFoundException(
                 "Signature", "token", token));

     signature.setSignatureData(signatureData);
     signature.setIpAddress(ipAddress);
     signature.setUserAgent(userAgent);
     signature.setStatus(ESignature.Status.SIGNED);
     signature.setSignedAt(LocalDateTime.now());

     return repository.save(signature);
 }

 @Override
 public ESignature getByToken(String token) {
     return repository.findByVerificationToken(token)
             .orElseThrow(() -> new ResourceNotFoundException(
                 "Signature", "token", token));
 }

 @Override
 public List<ESignature> getAllSignatures() {
     return repository.findAllByOrderByCreatedAtDesc();
 }

 @Override
 public List<ESignature> getByDocument(Long docId, String type) {
     return repository.findByDocumentIdAndDocumentType(docId, type);
 }
}