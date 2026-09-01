
//dto/response/ProjectResponse.java
package com.hrms.dto.response;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ProjectResponse {
 private Long id;
 private String projectCode;
 private String name;
 private String description;
 private String clientName;
 private Long projectManagerId;
 private String projectManagerName;
 private LocalDate startDate;
 private LocalDate endDate;
 private BigDecimal estimatedHours;
 private BigDecimal actualHours;
 private BigDecimal budget;
 private String status;
 private String priority;
 private String color;
 private Boolean isBillable;
 private BigDecimal hourlyRate;
 private Integer totalMembers;
 private Integer totalTasks;
 private Integer completedTasks;
 private Double progressPercentage;
 private List<ProjectMemberInfo> members;
 private LocalDateTime createdAt;
}

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
class ProjectMemberInfo {
 private Long id;
 private Long employeeId;
 private String employeeName;
 private String employeeCode;
 private String role;
}