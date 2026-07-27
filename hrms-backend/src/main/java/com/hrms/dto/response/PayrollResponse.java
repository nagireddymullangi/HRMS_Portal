
//dto/response/PayrollResponse.java
package com.hrms.dto.response;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PayrollResponse {
 private Long id;
 private Long employeeId;
 private String employeeName;
 private String employeeCode;
 private String departmentName;
 private String designation;
 private Integer month;
 private Integer year;
 private BigDecimal basicSalary;
 private BigDecimal hra;
 private BigDecimal transportAllowance;
 private BigDecimal medicalAllowance;
 private BigDecimal otherAllowances;
 private BigDecimal grossSalary;
 private BigDecimal pfDeduction;
 private BigDecimal taxDeduction;
 private BigDecimal otherDeductions;
 private BigDecimal totalDeductions;
 private BigDecimal netSalary;
 private Integer workingDays;
 private Integer presentDays;
 private String status;
 private LocalDateTime generatedAt;
 private LocalDateTime paidAt;
}