// Update model/Attendance.java - Add new fields
package com.hrms.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
@Table(name = "attendance",
       uniqueConstraints = @UniqueConstraint(
           columnNames = {"employee_id", "date"}))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Attendance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @Column(nullable = false)
    private LocalDate date;

    @Column(name = "check_in")
    private LocalTime checkIn;

    @Column(name = "check_out")
    private LocalTime checkOut;

    @Enumerated(EnumType.STRING)
    private Status status = Status.ABSENT;

    @Column(name = "working_hours")
    private Double workingHours;

    @Column(columnDefinition = "TEXT")
    private String notes;

    // ============ NEW BIOMETRIC FIELDS ============

    @Enumerated(EnumType.STRING)
    @Column(name = "attendance_mode")
    private AttendanceMode attendanceMode = AttendanceMode.MANUAL;

    @Column(name = "check_in_photo", length = 500)
    private String checkInPhoto;

    @Column(name = "check_out_photo", length = 500)
    private String checkOutPhoto;

    @Column(name = "check_in_location", length = 500)
    private String checkInLocation;

    @Column(name = "check_out_location", length = 500)
    private String checkOutLocation;

    @Column(name = "check_in_latitude", precision = 10, scale = 7)
    private BigDecimal checkInLatitude;

    @Column(name = "check_in_longitude", precision = 10, scale = 7)
    private BigDecimal checkInLongitude;

    @Column(name = "check_out_latitude", precision = 10, scale = 7)
    private BigDecimal checkOutLatitude;

    @Column(name = "check_out_longitude", precision = 10, scale = 7)
    private BigDecimal checkOutLongitude;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "device_id")
    private BiometricDevice device;

    @Column(name = "verification_score", precision = 4, scale = 2)
    private BigDecimal verificationScore;

    @Column(name = "is_verified")
    private Boolean isVerified = false;

    // ============ TIMESTAMPS ============

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public enum Status {
        PRESENT, ABSENT, HALF_DAY, ON_LEAVE
    }

    public enum AttendanceMode {
        MANUAL, FACE_RECOGNITION, BIOMETRIC, GPS, SELFIE, QR_CODE
    }
}