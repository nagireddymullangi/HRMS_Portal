
//model/StatutoryRecord.java
package com.hrms.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "statutory_records")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class StatutoryRecord {

 @Id
 @GeneratedValue(strategy = GenerationType.IDENTITY)
 private Long id;

 @Enumerated(EnumType.STRING)
 @Column(name = "record_type", nullable = false)
 private RecordType recordType;

 @Column(name = "reference_number", unique = true, length = 100)
 private String referenceNumber;

 @ManyToOne(fetch = FetchType.LAZY)
 @JoinColumn(name = "employee_id")
 private Employee employee;

 @Column(name = "period_month")
 private Integer periodMonth;

 @Column(name = "period_year", nullable = false)
 private Integer periodYear;

 @Column(precision = 12, scale = 2)
 private BigDecimal amount = BigDecimal.ZERO;

 @Column(name = "employer_contribution", precision = 12, scale = 2)
 private BigDecimal employerContribution = BigDecimal.ZERO;

 @Column(name = "employee_contribution", precision = 12, scale = 2)
 private BigDecimal employeeContribution = BigDecimal.ZERO;

 @Column(name = "total_amount", precision = 12, scale = 2)
 private BigDecimal totalAmount = BigDecimal.ZERO;

 @Enumerated(EnumType.STRING)
 @Column(name = "filing_status")
 private FilingStatus filingStatus = FilingStatus.PENDING;

 @Column(name = "filing_date")
 private LocalDate filingDate;

 @Column(name = "payment_date")
 private LocalDate paymentDate;

 @Column(name = "acknowledgment_number", length = 100)
 private String acknowledgmentNumber;

 @Column(name = "challan_number", length = 100)
 private String challanNumber;

 @Column(name = "document_url", length = 500)
 private String documentUrl;

 @Column(columnDefinition = "TEXT")
 private String notes;

 @Column(name = "created_by")
 private Long createdBy;

 @CreationTimestamp
 @Column(name = "created_at", updatable = false)
 private LocalDateTime createdAt;

 @UpdateTimestamp
 @Column(name = "updated_at")
 private LocalDateTime updatedAt;

 public enum RecordType {
     PF, ESI, PT, TDS, GRATUITY, INCOME_TAX,
     LWF, BONUS, FORM_16, FORM_24Q, OTHER
 }

 public enum FilingStatus {
     PENDING, FILED, PAID, ACKNOWLEDGED, FAILED
 }
}