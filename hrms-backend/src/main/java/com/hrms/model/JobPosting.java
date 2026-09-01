
//model/JobPosting.java
package com.hrms.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "job_postings")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class JobPosting {

 @Id
 @GeneratedValue(strategy = GenerationType.IDENTITY)
 private Long id;

 @Column(name = "job_code", unique = true, nullable = false, length = 50)
 private String jobCode;

 @Column(nullable = false, length = 255)
 private String title;

 @ManyToOne(fetch = FetchType.LAZY)
 @JoinColumn(name = "department_id")
 private Department department;

 @Column(length = 200)
 private String location;

 @Enumerated(EnumType.STRING)
 @Column(name = "employment_type")
 private EmploymentType employmentType = EmploymentType.FULL_TIME;

 @Column(name = "experience_min")
 private Integer experienceMin = 0;

 @Column(name = "experience_max")
 private Integer experienceMax;

 @Column(name = "salary_min", precision = 10, scale = 2)
 private BigDecimal salaryMin;

 @Column(name = "salary_max", precision = 10, scale = 2)
 private BigDecimal salaryMax;

 @Column(columnDefinition = "LONGTEXT")
 private String description;

 @Column(columnDefinition = "LONGTEXT")
 private String responsibilities;

 @Column(columnDefinition = "LONGTEXT")
 private String requirements;

 @Column(columnDefinition = "TEXT")
 private String benefits;

 @Column(name = "skills_required", columnDefinition = "TEXT")
 private String skillsRequired;

 private Integer openings = 1;

 @Column(name = "posted_date")
 private LocalDate postedDate;

 @Column(name = "closing_date")
 private LocalDate closingDate;

 @Enumerated(EnumType.STRING)
 private Status status = Status.DRAFT;

 @Column(name = "hiring_manager_id")
 private Long hiringManagerId;

 @Column(name = "total_applications")
 private Integer totalApplications = 0;

 @Column(name = "is_internal")
 private Boolean isInternal = false;

 @Column(name = "created_by")
 private Long createdBy;

 @CreationTimestamp
 @Column(name = "created_at", updatable = false)
 private LocalDateTime createdAt;

 @UpdateTimestamp
 @Column(name = "updated_at")
 private LocalDateTime updatedAt;

 public enum EmploymentType {
     FULL_TIME, PART_TIME, CONTRACT, INTERNSHIP
 }

 public enum Status {
     DRAFT, OPEN, CLOSED, ON_HOLD, FILLED
 }
}