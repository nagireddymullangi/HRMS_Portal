
//model/ExpenseCategory.java
package com.hrms.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "expense_categories")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ExpenseCategory {

 @Id
 @GeneratedValue(strategy = GenerationType.IDENTITY)
 private Long id;

 @Column(nullable = false, unique = true, length = 100)
 private String name;

 @Column(columnDefinition = "TEXT")
 private String description;

 @Column(name = "max_amount", precision = 10, scale = 2)
 private BigDecimal maxAmount;

 @Column(name = "requires_receipt")
 private Boolean requiresReceipt = true;

 @Column(name = "is_active")
 private Boolean isActive = true;

 @CreationTimestamp
 @Column(name = "created_at", updatable = false)
 private LocalDateTime createdAt;
}