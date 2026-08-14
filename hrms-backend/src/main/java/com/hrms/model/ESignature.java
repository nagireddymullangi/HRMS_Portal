
//model/ESignature.java
package com.hrms.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "e_signatures")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ESignature {

 @Id
 @GeneratedValue(strategy = GenerationType.IDENTITY)
 private Long id;

 @Column(name = "document_id")
 private Long documentId;

 @Column(name = "document_type", length = 50)
 private String documentType;

 @Column(name = "signer_name", nullable = false, length = 150)
 private String signerName;

 @Column(name = "signer_email", nullable = false, length = 150)
 private String signerEmail;

 @Column(name = "signature_data", nullable = false, columnDefinition = "LONGTEXT")
 private String signatureData;

 @Enumerated(EnumType.STRING)
 @Column(name = "signature_type")
 private SignatureType signatureType = SignatureType.DRAWN;

 @Column(name = "ip_address", length = 50)
 private String ipAddress;

 @Column(name = "user_agent", length = 500)
 private String userAgent;

 @Enumerated(EnumType.STRING)
 private Status status = Status.PENDING;

 @Column(name = "signed_at")
 private LocalDateTime signedAt;

 @Column(name = "verification_token", unique = true)
 private String verificationToken;

 @CreationTimestamp
 @Column(name = "created_at", updatable = false)
 private LocalDateTime createdAt;

 public enum SignatureType { DRAWN, TYPED, UPLOADED }
 public enum Status { PENDING, SIGNED, REJECTED, EXPIRED }
}