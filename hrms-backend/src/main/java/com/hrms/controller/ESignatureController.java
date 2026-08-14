
//controller/ESignatureController.java
package com.hrms.controller;

import com.hrms.dto.response.ApiResponse;
import com.hrms.model.ESignature;
import com.hrms.service.ESignatureService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/signatures")
@RequiredArgsConstructor
public class ESignatureController {

 private final ESignatureService service;

 @PostMapping("/request")
 @PreAuthorize("hasRole('ADMIN')")
 public ResponseEntity<ApiResponse<ESignature>> request(
         @RequestBody ESignature signature) {
     return ResponseEntity.ok(ApiResponse.success(
         "Signature request created", service.requestSignature(signature)));
 }

 @GetMapping("/verify/{token}")
 public ResponseEntity<ApiResponse<ESignature>> verify(
         @PathVariable String token) {
     return ResponseEntity.ok(ApiResponse.success(
         "Success", service.getByToken(token)));
 }

 @PostMapping("/sign/{token}")
 public ResponseEntity<ApiResponse<ESignature>> sign(
         @PathVariable String token,
         @RequestBody Map<String, String> body,
         HttpServletRequest request) {

     String ip = request.getRemoteAddr();
     String userAgent = request.getHeader("User-Agent");

     return ResponseEntity.ok(ApiResponse.success("Signed",
         service.signDocument(token, body.get("signatureData"),
             ip, userAgent)));
 }

 @GetMapping
 @PreAuthorize("hasRole('ADMIN')")
 public ResponseEntity<ApiResponse<List<ESignature>>> getAll() {
     return ResponseEntity.ok(ApiResponse.success("Success",
         service.getAllSignatures()));
 }
}