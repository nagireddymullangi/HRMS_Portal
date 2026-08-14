
//service/ESignatureService.java
package com.hrms.service;

import com.hrms.model.ESignature;
import java.util.List;

public interface ESignatureService {
 ESignature requestSignature(ESignature signature);
 ESignature signDocument(String token, String signatureData,
                          String ipAddress, String userAgent);
 ESignature getByToken(String token);
 List<ESignature> getAllSignatures();
 List<ESignature> getByDocument(Long docId, String type);
}