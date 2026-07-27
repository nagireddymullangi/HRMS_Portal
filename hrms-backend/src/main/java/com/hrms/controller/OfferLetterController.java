
//controller/OfferLetterController.java
package com.hrms.controller;

import com.hrms.dto.request.OfferLetterRequest;
import com.hrms.dto.response.ApiResponse;
import com.hrms.dto.response.OfferLetterResponse;
import com.hrms.service.OfferLetterService;
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
@RequestMapping("/api/offer-letters")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class OfferLetterController {

 private final OfferLetterService service;

 @PostMapping
 public ResponseEntity<ApiResponse<OfferLetterResponse>> create(
         @Valid @RequestBody OfferLetterRequest request) {
     return new ResponseEntity<>(
             ApiResponse.success("Offer letter created", service.create(request)),
             HttpStatus.CREATED);
 }

 @GetMapping
 public ResponseEntity<ApiResponse<List<OfferLetterResponse>>> getAll() {
     return ResponseEntity.ok(ApiResponse.success("Success", service.getAll()));
 }

 @GetMapping("/{id}")
 public ResponseEntity<ApiResponse<OfferLetterResponse>> getById(
         @PathVariable Long id) {
     return ResponseEntity.ok(
             ApiResponse.success("Success", service.getById(id)));
 }

 @PutMapping("/{id}")
 public ResponseEntity<ApiResponse<OfferLetterResponse>> update(
         @PathVariable Long id,
         @Valid @RequestBody OfferLetterRequest request) {
     return ResponseEntity.ok(
             ApiResponse.success("Updated", service.update(id, request)));
 }

 @PatchMapping("/{id}/status")
 public ResponseEntity<ApiResponse<OfferLetterResponse>> updateStatus(
         @PathVariable Long id, @RequestBody Map<String, String> body) {
     return ResponseEntity.ok(ApiResponse.success("Status updated",
             service.updateStatus(id, body.get("status"), body.get("reason"))));
 }

 @DeleteMapping("/{id}")
 public ResponseEntity<ApiResponse<String>> delete(@PathVariable Long id) {
     service.delete(id);
     return ResponseEntity.ok(ApiResponse.success("Deleted"));
 }

 @GetMapping("/{id}/pdf")
 public ResponseEntity<ByteArrayResource> downloadPdf(@PathVariable Long id) {
     byte[] pdf = service.generatePdf(id);
     ByteArrayResource resource = new ByteArrayResource(pdf);

     return ResponseEntity.ok()
             .contentType(MediaType.APPLICATION_PDF)
             .header(HttpHeaders.CONTENT_DISPOSITION,
                     "attachment; filename=\"offer_letter_" + id + ".pdf\"")
             .contentLength(pdf.length)
             .body(resource);
 }
}