package com.hrms.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
@Table(name = "daily_work_assignments")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class DailyWorkAssignment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "assignment_number", unique = true, nullable = false, length = 50)
    private String assignmentNumber;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @Column(name = "assigned_by", nullable = false)
    private Long assignedBy;

    @Column(nullable = false, length = 255)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    private Category category = Category.DEVELOPMENT;

    @Enumerated(EnumType.STRING)
    private Priority priority = Priority.MEDIUM;

    @Enumerated(EnumType.STRING)
    private Status status = Status.ASSIGNED;

    @Column(name = "assignment_date", nullable = false)
    private LocalDate assignmentDate;

    @Column(name = "due_date")
    private LocalDate dueDate;

    @Column(name = "due_time")
    private LocalTime dueTime;

    @Column(name = "estimated_hours", precision = 4, scale = 2)
    private BigDecimal estimatedHours;

    @Column(name = "actual_hours", precision = 4, scale = 2)
    private BigDecimal actualHours = BigDecimal.ZERO;

    @Column(name = "progress_percentage")
    private Integer progressPercentage = 0;

    @Column(name = "project_id")
    private Long projectId;

    @Column(length = 500)
    private String tags;

    @Column(columnDefinition = "TEXT")
    private String blockerReason;

    @Column(name = "completion_notes", columnDefinition = "TEXT")
    private String completionNotes;

    // ============ TIME TRACKING ============
    @Column(name = "accepted_at")
    private LocalDateTime acceptedAt;

    @Column(name = "started_at")
    private LocalDateTime startedAt;

    @Column(name = "paused_at")
    private LocalDateTime pausedAt;

    @Column(name = "resumed_at")
    private LocalDateTime resumedAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @Column(name = "total_active_seconds")
    @Builder.Default
    private Long totalActiveSeconds = 0L;

    @Column(name = "total_pause_seconds")
    @Builder.Default
    private Long totalPauseSeconds = 0L;

    @Column(name = "pause_count")
    @Builder.Default
    private Integer pauseCount = 0;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public enum Category {
        DEVELOPMENT, TESTING, MEETING, DOCUMENTATION,
        CLIENT_WORK, TRAINING, SUPPORT, ADMIN, OTHER
    }

    public enum Priority { LOW, MEDIUM, HIGH, URGENT, CRITICAL }

    public enum Status {
        ASSIGNED, ACCEPTED, IN_PROGRESS, ON_HOLD,
        BLOCKED, COMPLETED, CANCELLED, OVERDUE
    }

    public boolean isOverdue() {
        if (dueDate == null || status == Status.COMPLETED || status == Status.CANCELLED) return false;
        return LocalDate.now().isAfter(dueDate);
    }

    public Long getCurrentElapsedSeconds() {
        if (startedAt == null) return 0L;
        LocalDateTime endTime = completedAt != null ? completedAt :
                (status == Status.ON_HOLD || status == Status.BLOCKED) ? pausedAt : LocalDateTime.now();
        if (endTime == null) return 0L;
        
        LocalDateTime lastResume = resumedAt != null ? resumedAt : startedAt;
        long currentSession = (status == Status.IN_PROGRESS) ? 
                Duration.between(lastResume, LocalDateTime.now()).getSeconds() : 0;
                
        return totalActiveSeconds + currentSession;
    }
}