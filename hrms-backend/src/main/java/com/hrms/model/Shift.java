
//model/Shift.java
package com.hrms.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
@Table(name = "shifts")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Shift {

 @Id
 @GeneratedValue(strategy = GenerationType.IDENTITY)
 private Long id;

 @Column(nullable = false, length = 100)
 private String name;

 @Column(name = "start_time", nullable = false)
 private LocalTime startTime;

 @Column(name = "end_time", nullable = false)
 private LocalTime endTime;

 @Column(name = "break_minutes")
 private Integer breakMinutes = 60;

 @Column(name = "working_hours")
 private Double workingHours;

 @Column(name = "is_night_shift")
 private Boolean isNightShift = false;

 @Column(name = "is_active")
 private Boolean isActive = true;

 @CreationTimestamp
 @Column(name = "created_at", updatable = false)
 private LocalDateTime createdAt;
}