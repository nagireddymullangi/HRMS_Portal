
//dto/request/EmployeeRequest.java
package com.hrms.dto.request;

import jakarta.validation.constraints.*;
import lombok.*;
import java.time.LocalDate;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class EmployeeRequest {

 @NotBlank(message = "First name is required")
 private String firstName;

 @NotBlank(message = "Last name is required")
 private String lastName;

 @NotBlank(message = "Email is required")
 @Email(message = "Invalid email format")
 private String email;

 private String phone;
 private LocalDate dateOfBirth;
 private LocalDate dateOfJoining;
 private String designation;
 private Long departmentId;
 private String address;
 private String status;

 // For creating user account
 @NotBlank(message = "Username is required")
 private String username;

 @NotBlank(message = "Password is required")
 @Size(min = 6, message = "Password must be at least 6 characters")
 private String password;

 // Salary info
 private java.math.BigDecimal basicSalary;
}