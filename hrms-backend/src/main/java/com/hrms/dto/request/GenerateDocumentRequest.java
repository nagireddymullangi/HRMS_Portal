
//dto/request/GenerateDocumentRequest.java
package com.hrms.dto.request;

import lombok.*;

import java.util.Map;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class GenerateDocumentRequest {
 private Long templateId;
 private Long employeeId;
 private Map<String, String> variables;
}