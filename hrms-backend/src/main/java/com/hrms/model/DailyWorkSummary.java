
//model/DailyWorkSummary.java
package com.hrms.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "daily_work_summary",
    uniqueConstraints = @UniqueConstraint(
        columnNames = {"employee_id", "summary_date"}))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class DailyWorkSummary {

 @Id
 @GeneratedValue(strategy = GenerationType.IDENTITY)
 private Long id;

 @ManyToOne(fetch = FetchType.LAZY)
 @JoinColumn(name = "employee_id", nullable = false)
 private Employee employee;

 @Column(name = "summary_date", nullable = false)
 private LocalDate summaryDate;

 @Column(name = "total_tasks_assigned")
 private Integer totalTasksAssigned = 0;

 @Column(name = "tasks_completed")
 private Integer tasksCompleted = 0;

 @Column(name = "tasks_in_progress")
 private Integer tasksInProgress = 0;

 @Column(name = "tasks_pending")
 private Integer tasksPending = 0;

 @Column(name = "tasks_blocked")
 private Integer tasksBlocked = 0;

 @Column(name = "total_work_minutes")
 private Integer totalWorkMinutes = 0;

 @Column(name = "total_break_minutes")
 private Integer totalBreakMinutes = 0;

 @Column(name = "total_lunch_minutes")
 private Integer totalLunchMinutes = 0;

 @Column(name = "total_meeting_minutes")
 private Integer totalMeetingMinutes = 0;

 @Column(name = "productivity_score", precision = 5, scale = 2)
 private BigDecimal productivityScore;

 @CreationTimestamp
 @Column(name = "created_at", updatable = false)
 private LocalDateTime createdAt;

 @UpdateTimestamp
 @Column(name = "updated_at")
 private LocalDateTime updatedAt;
}