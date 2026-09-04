package com.hrms.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Duration;
import java.time.LocalDateTime;

@Entity
@Table(name = "break_sessions")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class BreakSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @Enumerated(EnumType.STRING)
    @Column(name = "break_type")
    private BreakType breakType = BreakType.SHORT_BREAK;

    @Column(name = "start_time", nullable = false)
    private LocalDateTime startTime;

    @Column(name = "end_time")
    private LocalDateTime endTime;

    @Column(name = "duration_minutes")
    private Integer durationMinutes;

    @Column(name = "max_allowed_minutes")
    private Integer maxAllowedMinutes;

    @Column(name = "is_exceeded")
    private Boolean isExceeded = false;

    @Column(columnDefinition = "TEXT")
    private String reason;

    @Column(length = 200)
    private String location;

    @Enumerated(EnumType.STRING)
    private Status status = Status.ACTIVE;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    public enum BreakType {
        TEA_BREAK(15), LUNCH(60), SHORT_BREAK(10), MEETING(60), PERSONAL(15), BATHROOM(5), OTHER(15);
        private final int defaultMaxMinutes;
        BreakType(int minutes) { this.defaultMaxMinutes = minutes; }
        public int getDefaultMaxMinutes() { return defaultMaxMinutes; }
    }

    public enum Status { ACTIVE, COMPLETED, FORCE_STOPPED }

    public long getCurrentDurationMinutes() {
        if (endTime != null && durationMinutes != null) return durationMinutes;
        if (startTime != null) {
            return Duration.between(startTime, endTime != null ? endTime : LocalDateTime.now()).toMinutes();
        }
        return 0;
    }
}