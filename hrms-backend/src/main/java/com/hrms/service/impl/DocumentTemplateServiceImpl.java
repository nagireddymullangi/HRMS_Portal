
//service/impl/DocumentTemplateServiceImpl.java
package com.hrms.service.impl;

import com.hrms.dto.request.DocumentTemplateRequest;
import com.hrms.dto.request.GenerateDocumentRequest;
import com.hrms.dto.response.DocumentTemplateResponse;
import com.hrms.exception.ResourceNotFoundException;
import com.hrms.model.DocumentTemplate;
import com.hrms.model.Employee;
import com.hrms.model.GeneratedDocument;
import com.hrms.repository.DocumentTemplateRepository;
import com.hrms.repository.EmployeeRepository;
import com.hrms.repository.GeneratedDocumentRepository;
import com.hrms.service.DocumentTemplateService;
import com.hrms.utils.PdfGenerator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class DocumentTemplateServiceImpl implements DocumentTemplateService {

 private final DocumentTemplateRepository templateRepository;
 private final EmployeeRepository employeeRepository;
 private final GeneratedDocumentRepository generatedDocRepository;
 private final PdfGenerator pdfGenerator;

 @Override
 @Transactional
 public DocumentTemplateResponse create(DocumentTemplateRequest request) {
     DocumentTemplate template = DocumentTemplate.builder()
             .name(request.getName())
             .type(DocumentTemplate.DocumentType.valueOf(request.getType()))
             .subject(request.getSubject())
             .content(request.getContent())
             .variables(request.getVariables())
             .isActive(request.getIsActive() != null ?
                     request.getIsActive() : true)
             .isDefault(request.getIsDefault() != null ?
                     request.getIsDefault() : false)
             .build();
     return mapToResponse(templateRepository.save(template));
 }

 @Override
 @Transactional
 public DocumentTemplateResponse update(Long id,
                                         DocumentTemplateRequest request) {
     DocumentTemplate template = templateRepository.findById(id)
             .orElseThrow(() -> new ResourceNotFoundException(
                     "Template", "id", id));

     template.setName(request.getName());
     template.setType(DocumentTemplate.DocumentType.valueOf(request.getType()));
     template.setSubject(request.getSubject());
     template.setContent(request.getContent());
     template.setVariables(request.getVariables());
     if (request.getIsActive() != null)
         template.setIsActive(request.getIsActive());
     if (request.getIsDefault() != null)
         template.setIsDefault(request.getIsDefault());

     return mapToResponse(templateRepository.save(template));
 }

 @Override
 public DocumentTemplateResponse getById(Long id) {
     return mapToResponse(templateRepository.findById(id)
             .orElseThrow(() -> new ResourceNotFoundException(
                     "Template", "id", id)));
 }

 @Override
 public List<DocumentTemplateResponse> getAll() {
     return templateRepository.findAllByOrderByCreatedAtDesc()
             .stream().map(this::mapToResponse)
             .collect(Collectors.toList());
 }

 @Override
 public List<DocumentTemplateResponse> getByType(String type) {
     return templateRepository.findByTypeAndIsActiveTrue(
             DocumentTemplate.DocumentType.valueOf(type))
             .stream().map(this::mapToResponse)
             .collect(Collectors.toList());
 }

 @Override
 @Transactional
 public void delete(Long id) {
     DocumentTemplate template = templateRepository.findById(id)
             .orElseThrow(() -> new ResourceNotFoundException(
                     "Template", "id", id));
     templateRepository.delete(template);
 }

 @Override
 @Transactional
 public Map<String, Object> generateDocument(GenerateDocumentRequest request) {
     DocumentTemplate template = templateRepository.findById(
                     request.getTemplateId())
             .orElseThrow(() -> new ResourceNotFoundException(
                     "Template", "id", request.getTemplateId()));

     Map<String, String> variables = new HashMap<>();
     if (request.getVariables() != null)
         variables.putAll(request.getVariables());

     Employee employee = null;
     if (request.getEmployeeId() != null) {
         employee = employeeRepository.findById(request.getEmployeeId())
                 .orElse(null);
         if (employee != null) {
             variables.put("employeeName", employee.getFullName());
             variables.put("employeeId", employee.getEmployeeId());
             variables.put("designation",
                     employee.getDesignation() != null ?
                             employee.getDesignation() : "");
             variables.put("email", employee.getEmail());
             variables.put("department",
                     employee.getDepartment() != null ?
                             employee.getDepartment().getName() : "");
             variables.put("dateOfJoining",
                     employee.getDateOfJoining() != null ?
                             employee.getDateOfJoining().format(
                                 DateTimeFormatter.ofPattern("dd MMM yyyy"))
                             : "");
         }
     }

     // Add common variables
     variables.put("currentDate", LocalDate.now().format(
             DateTimeFormatter.ofPattern("dd MMM yyyy")));
     variables.put("companyName", "Potla Tech Solutions");

     // Replace placeholders
     String content = template.getContent();
     String subject = template.getSubject() != null ? template.getSubject() : "";

     for (Map.Entry<String, String> entry : variables.entrySet()) {
         String placeholder = "{{" + entry.getKey() + "}}";
         content = content.replace(placeholder, entry.getValue());
         subject = subject.replace(placeholder, entry.getValue());
     }

     // Save generated document
     GeneratedDocument doc = GeneratedDocument.builder()
             .documentNumber(generateDocumentNumber(template.getType().name()))
             .template(template)
             .employee(employee)
             .documentType(template.getType().name())
             .subject(subject)
             .content(content)
             .build();
     generatedDocRepository.save(doc);

     Map<String, Object> result = new HashMap<>();
     result.put("documentId", doc.getId());
     result.put("documentNumber", doc.getDocumentNumber());
     result.put("subject", subject);
     result.put("content", content);
     result.put("type", template.getType().name());
     return result;
 }

 @Override
 public byte[] generatePdfFromContent(String content, String title) {
     return pdfGenerator.generatePdfFromHtml(content, title);
 }

 private String generateDocumentNumber(String type) {
     long count = generatedDocRepository.count() + 1;
     String prefix = type.substring(0, Math.min(3, type.length()));
     return String.format("%s/%d/%04d", prefix,
             LocalDate.now().getYear(), count);
 }

 private DocumentTemplateResponse mapToResponse(DocumentTemplate t) {
     return DocumentTemplateResponse.builder()
             .id(t.getId())
             .name(t.getName())
             .type(t.getType().name())
             .subject(t.getSubject())
             .content(t.getContent())
             .variables(t.getVariables())
             .isActive(t.getIsActive())
             .isDefault(t.getIsDefault())
             .createdAt(t.getCreatedAt())
             .updatedAt(t.getUpdatedAt())
             .build();
 }
}