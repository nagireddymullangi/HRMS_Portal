
//model/GeneratedDocument.java
package com.hrms.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "generated_documents")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class GeneratedDocument {

 @Id
 @GeneratedValue(strategy = GenerationType.IDENTITY)
 private Long id;

 @Column(name = "document_number", unique = true, nullable = false)
 private String documentNumber;

 @ManyToOne(fetch = FetchType.LAZY)
 @JoinColumn(name = "template_id")
 private DocumentTemplate template;

 @ManyToOne(fetch = FetchType.LAZY)
 @JoinColumn(name = "employee_id")
 private Employee employee;

 @Column(name = "document_type", nullable = false, length = 50)
 private String documentType;

 @Column(length = 255)
 private String subject;

 @Column(nullable = false, columnDefinition = "LONGTEXT")
 private String content;

 @Column(name = "file_path", length = 500)
 private String filePath;

 @Column(name = "generated_by")
 private Long generatedBy;

 @CreationTimestamp
 @Column(name = "generated_at", updatable = false)
 private LocalDateTime generatedAt;
}