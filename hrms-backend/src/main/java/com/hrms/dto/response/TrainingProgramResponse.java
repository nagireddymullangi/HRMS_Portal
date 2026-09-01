
//dto/response/TrainingProgramResponse.java
package com.hrms.dto.response;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class TrainingProgramResponse {
 private Long id;
 private String programCode;
 private String title;
 private String description;
 private String category;
 private String trainingType;
 private BigDecimal durationHours;
 private String trainerName;
 private String trainerEmail;
 private Integer maxParticipants;
 private LocalDate startDate;
 private LocalDate endDate;
 private String location;
 private String meetingLink;
 private BigDecimal costPerParticipant;
 private String materialsUrl;
 private String prerequisites;
 private String learningObjectives;
 private String status;
 private Boolean isMandatory;
 private Long totalEnrolled;
 private Long totalCompleted;
 private Double averageRating;
 private Boolean isEnrolled;
 private String myStatus;
 private LocalDateTime createdAt;
}