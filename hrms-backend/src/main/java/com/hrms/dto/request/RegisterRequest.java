//dto/request/RegisterRequest.java
package com.hrms.dto.request;

import jakarta.validation.constraints.*;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RegisterRequest {

 @NotBlank(message = "Username is required")
 @Size(min = 3, max = 50, message = "Username must be between 3-50 characters")
 private String username;

 @NotBlank(message = "Email is required")
 @Email(message = "Invalid email format")
 private String email;

 @NotBlank(message = "Password is required")
 @Size(min = 6, message = "Password must be at least 6 characters")
 private String password;

 private String role; // ROLE_ADMIN or ROLE_EMPLOYEE
}