
//model/AnnouncementRead.java
package com.hrms.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "announcement_reads",
    uniqueConstraints = @UniqueConstraint(
        columnNames = {"announcement_id", "employee_id"}))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class AnnouncementRead {

 @Id
 @GeneratedValue(strategy = GenerationType.IDENTITY)
 private Long id;

 @ManyToOne(fetch = FetchType.LAZY)
 @JoinColumn(name = "announcement_id", nullable = false)
 private Announcement announcement;

 @ManyToOne(fetch = FetchType.LAZY)
 @JoinColumn(name = "employee_id", nullable = false)
 private Employee employee;

 @CreationTimestamp
 @Column(name = "read_at", updatable = false)
 private LocalDateTime readAt;
}