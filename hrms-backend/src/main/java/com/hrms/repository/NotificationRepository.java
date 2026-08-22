
//repository/NotificationRepository.java
package com.hrms.repository;

import com.hrms.model.Notification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {

 Page<Notification> findByUserIdOrderByCreatedAtDesc(
     Long userId, Pageable pageable);

 List<Notification> findTop10ByUserIdOrderByCreatedAtDesc(Long userId);

 Long countByUserIdAndIsReadFalse(Long userId);

 @Modifying
 @Query("UPDATE Notification n SET n.isRead = true, " +
        "n.readAt = CURRENT_TIMESTAMP WHERE n.userId = :userId " +
        "AND n.isRead = false")
 void markAllAsRead(@Param("userId") Long userId);

 @Modifying
 @Query("UPDATE Notification n SET n.isRead = true, " +
        "n.readAt = CURRENT_TIMESTAMP WHERE n.id = :id")
 void markAsRead(@Param("id") Long id);

 @Modifying
 @Query("DELETE FROM Notification n WHERE n.userId = :userId " +
        "AND n.isRead = true")
 void deleteAllReadByUser(@Param("userId") Long userId);
}