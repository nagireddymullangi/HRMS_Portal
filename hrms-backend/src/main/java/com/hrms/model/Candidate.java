
//model/Candidate.java
package com.hrms.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "candidates")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Candidate {

 @Id
 @GeneratedValue(strategy = GenerationType.IDENTITY)
 private Long id;

 @Column(name = "first_name", nullable = false, length = 100)
 private String firstName;

 @Column(name = "last_name", nullable = false, length = 100)
 private String lastName;

 @Column(nullable = false, unique = true, length = 150)
 private String email;

 @Column(length = 20)
 private String phone;

 @Column(name = "current_company", length = 200)
 private String currentCompany;

 @Column(name = "current_designation", length = 100)
 private String currentDesignation;

 @Column(name = "total_experience", precision = 4, scale = 1)
 private BigDecimal totalExperience;

 @Column(name = "current_salary", precision = 10, scale = 2)
 private BigDecimal currentSalary;

 @Column(name = "expected_salary", precision = 10, scale = 2)
 private BigDecimal expectedSalary;

 @Column(name = "notice_period")
 private Integer noticePeriod;

 @Column(name = "resume_url", length = 500)
 private String resumeUrl;

 @Column(name = "linkedin_url", length = 500)
 private String linkedinUrl;

 @Column(name = "portfolio_url", length = 500)
 private String portfolioUrl;

 @Column(length = 200)
 private String location;

 @Column(columnDefinition = "TEXT")
 private String skills;

 @Column(columnDefinition = "TEXT")
 private String education;

 @Enumerated(EnumType.STRING)
 private Source source = Source.WEBSITE;

 @Column(name = "referred_by")
 private Long referredBy;

 @CreationTimestamp
 @Column(name = "created_at", updatable = false)
 private LocalDateTime createdAt;

 @UpdateTimestamp
 @Column(name = "updated_at")
 private LocalDateTime updatedAt;

 public String getFullName() {
     return firstName + " " + lastName;
 }

 public enum Source {
     WEBSITE, LINKEDIN, REFERRAL, JOB_PORTAL, WALK_IN, OTHER
 }
}