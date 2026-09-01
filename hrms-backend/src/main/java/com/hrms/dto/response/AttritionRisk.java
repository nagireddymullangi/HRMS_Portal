package com.hrms.dto.response;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;


@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class AttritionRisk {
 private Long employeeId;
 private String employeeName;
 private String employeeCode;
 private String department;
 private String designation;
 private Double riskScore;
 private String riskLevel;
 private List<String> factors;
 private List<String> suggestedActions;
}