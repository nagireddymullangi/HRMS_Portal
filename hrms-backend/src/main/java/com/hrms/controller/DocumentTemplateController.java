
//controller/DocumentTemplateController.java
package com.hrms.controller;

import com.hrms.dto.request.DocumentTemplateRequest;
import com.hrms.dto.request.GenerateDocumentRequest;
import com.hrms.dto.response.ApiResponse;
import com.hrms.dto.response.DocumentTemplateResponse;
import com.hrms.service.DocumentTemplateService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/document-templates")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class DocumentTemplateController {

 private final DocumentTemplateService service;

 @PostMapping
 public ResponseEntity<ApiResponse<DocumentTemplateResponse>> create(
         @Valid @RequestBody DocumentTemplateRequest request) {
     return new ResponseEntity<>(
             ApiResponse.success("Template created", service.create(request)),
             HttpStatus.CREATED);
 }

 @GetMapping
 public ResponseEntity<ApiResponse<List<DocumentTemplateResponse>>> getAll() {
     return ResponseEntity.ok(ApiResponse.success("Success", service.getAll()));
 }

 @GetMapping("/{id}")
 public ResponseEntity<ApiResponse<DocumentTemplateResponse>> getById(
         @PathVariable Long id) {
     return ResponseEntity.ok(
             ApiResponse.success("Success", service.getById(id)));
 }

 @GetMapping("/type/{type}")
 public ResponseEntity<ApiResponse<List<DocumentTemplateResponse>>> getByType(
         @PathVariable String type) {
     return ResponseEntity.ok(
             ApiResponse.success("Success", service.getByType(type)));
 }

 @PutMapping("/{id}")
 public ResponseEntity<ApiResponse<DocumentTemplateResponse>> update(
         @PathVariable Long id,
         @Valid @RequestBody DocumentTemplateRequest request) {
     return ResponseEntity.ok(
             ApiResponse.success("Updated", service.update(id, request)));
 }

 @DeleteMapping("/{id}")
 public ResponseEntity<ApiResponse<String>> delete(@PathVariable Long id) {
     service.delete(id);
     return ResponseEntity.ok(ApiResponse.success("Deleted"));
 }

 @PostMapping("/generate")
 public ResponseEntity<ApiResponse<Map<String, Object>>> generate(
         @RequestBody GenerateDocumentRequest request) {
     return ResponseEntity.ok(
             ApiResponse.success("Generated", service.generateDocument(request)));
 }

 @PostMapping("/generate-pdf")
 public ResponseEntity<ByteArrayResource> generatePdf(
         @RequestBody Map<String, String> body) {
     byte[] pdf = service.generatePdfFromContent(
             body.get("content"), body.get("title"));
     ByteArrayResource resource = new ByteArrayResource(pdf);

     return ResponseEntity.ok()
             .contentType(MediaType.APPLICATION_PDF)
             .header(HttpHeaders.CONTENT_DISPOSITION,
                     "attachment; filename=\"document.pdf\"")
             .contentLength(pdf.length)
             .body(resource);
 }
}