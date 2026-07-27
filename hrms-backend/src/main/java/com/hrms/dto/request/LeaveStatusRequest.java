
//dto/request/LeaveStatusRequest.java
package com.hrms.dto.request;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class LeaveStatusRequest {
 private String status;
 private String adminComment;
}