
//service/OfferLetterService.java
package com.hrms.service;

import com.hrms.dto.request.OfferLetterRequest;
import com.hrms.dto.response.OfferLetterResponse;

import java.util.List;

public interface OfferLetterService {
 OfferLetterResponse create(OfferLetterRequest request);
 OfferLetterResponse update(Long id, OfferLetterRequest request);
 OfferLetterResponse getById(Long id);
 List<OfferLetterResponse> getAll();
 OfferLetterResponse updateStatus(Long id, String status, String reason);
 void delete(Long id);
 byte[] generatePdf(Long id);
}