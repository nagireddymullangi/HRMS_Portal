
//model/BankDetails.java
package com.hrms.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "bank_details")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class BankDetails {

 @Id
 @GeneratedValue(strategy = GenerationType.IDENTITY)
 private Long id;

 @OneToOne(fetch = FetchType.LAZY)
 @JoinColumn(name = "employee_id", nullable = false, unique = true)
 private Employee employee;

 @Column(name = "account_holder_name", nullable = false, length = 150)
 private String accountHolderName;

 @Column(name = "bank_name", nullable = false, length = 150)
 private String bankName;

 @Column(name = "branch_name", length = 150)
 private String branchName;

 @Column(name = "account_number", nullable = false, length = 50)
 private String accountNumber;

 @Column(name = "ifsc_code", nullable = false, length = 20)
 private String ifscCode;

 @Enumerated(EnumType.STRING)
 @Column(name = "account_type")
 private AccountType accountType = AccountType.SAVINGS;

 @Column(name = "is_verified")
 private Boolean isVerified = false;

 @Column(name = "verified_at")
 private LocalDateTime verifiedAt;

 @CreationTimestamp
 @Column(name = "created_at", updatable = false)
 private LocalDateTime createdAt;

 @UpdateTimestamp
 @Column(name = "updated_at")
 private LocalDateTime updatedAt;

 public enum AccountType { SAVINGS, CURRENT, SALARY }
}