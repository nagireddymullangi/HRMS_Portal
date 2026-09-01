
//model/TrainingProgram.java
package com.hrms.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "training_programs")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class TrainingProgram {

 @Id
 @GeneratedValue(strategy = GenerationType.IDENTITY)
 private Long id;

 @Column(name = "program_code", unique = true, nullable = false)
 private String programCode;

 @Column(nullable = false, length = 255)
 private String title;

 @Column(columnDefinition = "LONGTEXT")
 private String description;

 @Enumerated(EnumType.STRING)
 private Category category = Category.TECHNICAL;

 @Enumerated(EnumType.STRING)
 @Column(name = "training_type")
 private TrainingType trainingType = TrainingType.ONLINE;

 @Column(name = "duration_hours", precision = 6, scale = 2)
 private BigDecimal durationHours;

 @Column(name = "trainer_name", length = 200)
 private String trainerName;

 @Column(name = "trainer_email", length = 150)
 private String trainerEmail;

 @Column(name = "max_participants")
 private Integer maxParticipants;

 @Column(name = "start_date")
 private LocalDate startDate;

 @Column(name = "end_date")
 private LocalDate endDate;

 @Column(length = 500)
 private String location;

 @Column(name = "meeting_link", length = 500)
 private String meetingLink;

 @Column(name = "cost_per_participant", precision = 10, scale = 2)
 private BigDecimal costPerParticipant;

 @Column(name = "materials_url", length = 500)
 private String materialsUrl;

 @Column(columnDefinition = "TEXT")
 private String prerequisites;

 @Column(name = "learning_objectives", columnDefinition = "TEXT")
 private String learningObjectives;

 @Enumerated(EnumType.STRING)
 private Status status = Status.PLANNED;

 @Column(name = "is_mandatory")
 private Boolean isMandatory = false;

 @Column(name = "created_by")
 private Long createdBy;

 @CreationTimestamp
 @Column(name = "created_at", updatable = false)
 private LocalDateTime createdAt;

 @UpdateTimestamp
 @Column(name = "updated_at")
 private LocalDateTime updatedAt;

 public enum Category {
     TECHNICAL, SOFT_SKILLS, LEADERSHIP, COMPLIANCE,
     ONBOARDING, CERTIFICATION, OTHER
 }

 public enum TrainingType {
     CLASSROOM, ONLINE, HYBRID, SELF_PACED, WORKSHOP
 }

 public enum Status {
     PLANNED, OPEN_FOR_ENROLLMENT, IN_PROGRESS, COMPLETED, CANCELLED
 }
}