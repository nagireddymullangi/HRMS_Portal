
//model/BiometricDevice.java
package com.hrms.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "biometric_devices")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class BiometricDevice {

 @Id
 @GeneratedValue(strategy = GenerationType.IDENTITY)
 private Long id;

 @Column(name = "device_name", nullable = false, length = 100)
 private String deviceName;

 @Enumerated(EnumType.STRING)
 @Column(name = "device_type", nullable = false)
 private DeviceType deviceType;

 @Column(length = 100)
 private String manufacturer;

 @Column(length = 100)
 private String model;

 @Column(name = "serial_number", unique = true, length = 100)
 private String serialNumber;

 @Column(name = "ip_address", length = 50)
 private String ipAddress;

 private Integer port;

 @Column(length = 200)
 private String location;

 @Column(name = "api_key", length = 255)
 private String apiKey;

 @Column(name = "is_active")
 private Boolean isActive = true;

 @Column(name = "last_sync")
 private LocalDateTime lastSync;

 @CreationTimestamp
 @Column(name = "created_at", updatable = false)
 private LocalDateTime createdAt;

 @UpdateTimestamp
 @Column(name = "updated_at")
 private LocalDateTime updatedAt;

 public enum DeviceType {
     FINGERPRINT, FACE, RFID, HYBRID
 }
}