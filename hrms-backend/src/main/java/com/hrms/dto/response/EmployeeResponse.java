
//dto/response/EmployeeResponse.java
package com.hrms.dto.response;

import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.math.BigDecimal;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class EmployeeResponse {
 private Long id;
 private String employeeId;
 private String firstName;
 private String lastName;
 private String fullName;
 private String email;
 private String phone;
 private LocalDate dateOfBirth;
 private LocalDate dateOfJoining;
 private String designation;
 private Long departmentId;
 private String departmentName;
 private String status;
 private String address;
 private Long userId;
 private String username;
 private BigDecimal basicSalary;
 private LocalDateTime createdAt;
}