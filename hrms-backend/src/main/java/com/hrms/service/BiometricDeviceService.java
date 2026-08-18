
//service/BiometricDeviceService.java
package com.hrms.service;

import com.hrms.dto.request.BiometricSyncRequest;
import com.hrms.model.BiometricDevice;

import java.util.List;
import java.util.Map;

public interface BiometricDeviceService {
 BiometricDevice createDevice(BiometricDevice device);
 BiometricDevice updateDevice(Long id, BiometricDevice device);
 List<BiometricDevice> getAllDevices();
 BiometricDevice getById(Long id);
 void deleteDevice(Long id);
 Map<String, Object> syncAttendanceFromDevice(BiometricSyncRequest request);
 Map<String, Object> testConnection(Long deviceId);
}