
// model/PolicyAcknowledgment.java
package com.hrms.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "policy_acknowledgments",
       uniqueConstraints = @UniqueConstraint(
           columnNames = {"policy_id", "employee_id"}))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PolicyAcknowledgment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "policy_id", nullable = false)
    private HrPolicy policy;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @CreationTimestamp
    @Column(name = "acknowledged_at", updatable = false)
    private LocalDateTime acknowledgedAt;

    @Column(name = "ip_address", length = 50)
    private String ipAddress;

    @Column(columnDefinition = "TEXT")
    private String signature;

    @Column(columnDefinition = "TEXT")
    private String comments;
}