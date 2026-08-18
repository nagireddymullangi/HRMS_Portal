
//dto/request/BiometricSyncRequest.java
package com.hrms.dto.request;

import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class BiometricSyncRequest {
 private String deviceSerialNumber;
 private String apiKey;
 private List<DeviceLog> logs;

 @Getter @Setter @NoArgsConstructor @AllArgsConstructor
 public static class DeviceLog {
     private String employeeCode;
     private LocalDateTime timestamp;
     private String type; // IN or OUT
     private String verificationMethod; // FP, FACE, RFID
 }
}