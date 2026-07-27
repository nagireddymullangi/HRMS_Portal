
//dto/request/PayrollRequest.java
package com.hrms.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.*;
import java.math.BigDecimal;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class PayrollRequest {

 @NotNull
 private Long employeeId;

 @NotNull
 private Integer month;

 @NotNull
 private Integer year;

 private BigDecimal basicSalary;
 private BigDecimal hra;
 private BigDecimal transportAllowance;
 private BigDecimal medicalAllowance;
 private BigDecimal otherAllowances;
 private BigDecimal pfDeduction;
 private BigDecimal taxDeduction;
 private BigDecimal otherDeductions;
}