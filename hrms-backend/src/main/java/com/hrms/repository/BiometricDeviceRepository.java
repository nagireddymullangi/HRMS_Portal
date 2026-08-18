
//repository/BiometricDeviceRepository.java
package com.hrms.repository;

import com.hrms.model.BiometricDevice;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface BiometricDeviceRepository extends JpaRepository<BiometricDevice, Long> {
 List<BiometricDevice> findByIsActiveTrue();
 Optional<BiometricDevice> findBySerialNumber(String serialNumber);
 Optional<BiometricDevice> findByApiKey(String apiKey);
}