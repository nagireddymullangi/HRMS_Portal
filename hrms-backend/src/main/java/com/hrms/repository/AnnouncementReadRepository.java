
//repository/AnnouncementReadRepository.java
package com.hrms.repository;

import com.hrms.model.AnnouncementRead;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface AnnouncementReadRepository extends JpaRepository<AnnouncementRead, Long> {

 Optional<AnnouncementRead> findByAnnouncementIdAndEmployeeId(
     Long announcementId, Long employeeId);

 Long countByAnnouncementId(Long announcementId);

 boolean existsByAnnouncementIdAndEmployeeId(Long announcementId, Long employeeId);
}