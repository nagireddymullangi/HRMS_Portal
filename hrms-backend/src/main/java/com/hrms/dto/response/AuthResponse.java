//dto/response/AuthResponse.java
package com.hrms.dto.response;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuthResponse {

 private String token;
 private String tokenType = "Bearer";
 private String role;
 private Long userId;
 private Long employeeId;
 private String name;
 private String email;
 private String username;

 public AuthResponse(String token, String role, Long userId,
                     Long employeeId, String name,
                     String email, String username) {
     this.token = token;
     this.tokenType = "Bearer";
     this.role = role;
     this.userId = userId;
     this.employeeId = employeeId;
     this.name = name;
     this.email = email;
     this.username = username;
 }
}