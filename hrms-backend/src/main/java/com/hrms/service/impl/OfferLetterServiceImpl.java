
//service/impl/OfferLetterServiceImpl.java
package com.hrms.service.impl;

import com.hrms.dto.request.OfferLetterRequest;
import com.hrms.dto.response.OfferLetterResponse;
import com.hrms.exception.HrmsAPIException;
import com.hrms.exception.ResourceNotFoundException;
import com.hrms.model.Department;
import com.hrms.model.OfferLetter;
import com.hrms.repository.DepartmentRepository;
import com.hrms.repository.OfferLetterRepository;
import com.hrms.service.OfferLetterService;
import com.hrms.utils.PdfGenerator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class OfferLetterServiceImpl implements OfferLetterService {

 private final OfferLetterRepository offerLetterRepository;
 private final DepartmentRepository departmentRepository;
 private final PdfGenerator pdfGenerator;

 @Override
 @Transactional
 public OfferLetterResponse create(OfferLetterRequest request) {
     Department department = null;
     if (request.getDepartmentId() != null) {
         department = departmentRepository.findById(request.getDepartmentId())
                 .orElseThrow(() -> new ResourceNotFoundException(
                         "Department", "id", request.getDepartmentId()));
     }

     OfferLetter offer = OfferLetter.builder()
             .offerNumber(generateOfferNumber())
             .candidateName(request.getCandidateName())
             .candidateEmail(request.getCandidateEmail())
             .candidatePhone(request.getCandidatePhone())
             .position(request.getPosition())
             .department(department)
             .offeredSalary(request.getOfferedSalary())
             .joiningDate(request.getJoiningDate())
             .offerDate(LocalDate.now())
             .expiryDate(request.getExpiryDate())
             .reportingManager(request.getReportingManager())
             .workLocation(request.getWorkLocation())
             .employmentType(request.getEmploymentType() != null
                     ? OfferLetter.EmploymentType.valueOf(request.getEmploymentType())
                     : OfferLetter.EmploymentType.FULL_TIME)
             .additionalTerms(request.getAdditionalTerms())
             .status(OfferLetter.Status.DRAFT)
             .build();

     return mapToResponse(offerLetterRepository.save(offer));
 }

 @Override
 @Transactional
 public OfferLetterResponse update(Long id, OfferLetterRequest request) {
     OfferLetter offer = offerLetterRepository.findById(id)
             .orElseThrow(() -> new ResourceNotFoundException(
                     "Offer Letter", "id", id));

     if (offer.getStatus() == OfferLetter.Status.ACCEPTED) {
         throw new HrmsAPIException(HttpStatus.BAD_REQUEST,
                 "Cannot edit an accepted offer letter");
     }

     Department department = null;
     if (request.getDepartmentId() != null) {
         department = departmentRepository.findById(request.getDepartmentId())
                 .orElseThrow(() -> new ResourceNotFoundException(
                         "Department", "id", request.getDepartmentId()));
     }

     offer.setCandidateName(request.getCandidateName());
     offer.setCandidateEmail(request.getCandidateEmail());
     offer.setCandidatePhone(request.getCandidatePhone());
     offer.setPosition(request.getPosition());
     offer.setDepartment(department);
     offer.setOfferedSalary(request.getOfferedSalary());
     offer.setJoiningDate(request.getJoiningDate());
     offer.setExpiryDate(request.getExpiryDate());
     offer.setReportingManager(request.getReportingManager());
     offer.setWorkLocation(request.getWorkLocation());
     offer.setAdditionalTerms(request.getAdditionalTerms());

     if (request.getEmploymentType() != null) {
         offer.setEmploymentType(
             OfferLetter.EmploymentType.valueOf(request.getEmploymentType()));
     }

     return mapToResponse(offerLetterRepository.save(offer));
 }

 @Override
 public OfferLetterResponse getById(Long id) {
     return mapToResponse(offerLetterRepository.findById(id)
             .orElseThrow(() -> new ResourceNotFoundException(
                     "Offer Letter", "id", id)));
 }

 @Override
 public List<OfferLetterResponse> getAll() {
     return offerLetterRepository.findAllByOrderByCreatedAtDesc()
             .stream().map(this::mapToResponse)
             .collect(Collectors.toList());
 }

 @Override
 @Transactional
 public OfferLetterResponse updateStatus(Long id, String status, String reason) {
     OfferLetter offer = offerLetterRepository.findById(id)
             .orElseThrow(() -> new ResourceNotFoundException(
                     "Offer Letter", "id", id));

     OfferLetter.Status newStatus = OfferLetter.Status.valueOf(status);
     offer.setStatus(newStatus);

     if (newStatus == OfferLetter.Status.ACCEPTED) {
         offer.setAcceptedAt(LocalDateTime.now());
     } else if (newStatus == OfferLetter.Status.REJECTED) {
         offer.setRejectedAt(LocalDateTime.now());
         offer.setRejectionReason(reason);
     }

     return mapToResponse(offerLetterRepository.save(offer));
 }

 @Override
 @Transactional
 public void delete(Long id) {
     OfferLetter offer = offerLetterRepository.findById(id)
             .orElseThrow(() -> new ResourceNotFoundException(
                     "Offer Letter", "id", id));
     offerLetterRepository.delete(offer);
 }

 @Override
 public byte[] generatePdf(Long id) {
     OfferLetter offer = offerLetterRepository.findById(id)
             .orElseThrow(() -> new ResourceNotFoundException(
                     "Offer Letter", "id", id));
     return pdfGenerator.generateOfferLetterPdf(offer);
 }

 private String generateOfferNumber() {
     long count = offerLetterRepository.count() + 1;
     return String.format("OFF/%d/%04d", LocalDate.now().getYear(), count);
 }

 private OfferLetterResponse mapToResponse(OfferLetter offer) {
     return OfferLetterResponse.builder()
             .id(offer.getId())
             .offerNumber(offer.getOfferNumber())
             .candidateName(offer.getCandidateName())
             .candidateEmail(offer.getCandidateEmail())
             .candidatePhone(offer.getCandidatePhone())
             .position(offer.getPosition())
             .departmentId(offer.getDepartment() != null ?
                     offer.getDepartment().getId() : null)
             .departmentName(offer.getDepartment() != null ?
                     offer.getDepartment().getName() : null)
             .offeredSalary(offer.getOfferedSalary())
             .joiningDate(offer.getJoiningDate())
             .offerDate(offer.getOfferDate())
             .expiryDate(offer.getExpiryDate())
             .reportingManager(offer.getReportingManager())
             .workLocation(offer.getWorkLocation())
             .employmentType(offer.getEmploymentType().name())
             .additionalTerms(offer.getAdditionalTerms())
             .status(offer.getStatus().name())
             .acceptedAt(offer.getAcceptedAt())
             .rejectedAt(offer.getRejectedAt())
             .rejectionReason(offer.getRejectionReason())
             .createdAt(offer.getCreatedAt())
             .build();
 }
}