
//service/DocumentTemplateService.java
package com.hrms.service;

import com.hrms.dto.request.DocumentTemplateRequest;
import com.hrms.dto.request.GenerateDocumentRequest;
import com.hrms.dto.response.DocumentTemplateResponse;

import java.util.List;
import java.util.Map;

public interface DocumentTemplateService {
 DocumentTemplateResponse create(DocumentTemplateRequest request);
 DocumentTemplateResponse update(Long id, DocumentTemplateRequest request);
 DocumentTemplateResponse getById(Long id);
 List<DocumentTemplateResponse> getAll();
 List<DocumentTemplateResponse> getByType(String type);
 void delete(Long id);
 Map<String, Object> generateDocument(GenerateDocumentRequest request);
 byte[] generatePdfFromContent(String content, String title);
}