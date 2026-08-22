
//repository/AnnouncementRepository.java
package com.hrms.repository;

import com.hrms.model.Announcement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AnnouncementRepository extends JpaRepository<Announcement, Long> {

 @Query("SELECT a FROM Announcement a WHERE a.isActive = true " +
        "AND (a.expiryDate IS NULL OR a.expiryDate > :now) " +
        "ORDER BY a.isPinned DESC, a.publishDate DESC")
 List<Announcement> findActiveAnnouncements(@Param("now") LocalDateTime now);

 @Query("SELECT a FROM Announcement a WHERE a.isActive = true " +
        "AND (a.expiryDate IS NULL OR a.expiryDate > :now) " +
        "AND (a.targetAudience = 'ALL' " +
        "   OR (a.targetAudience = 'DEPARTMENT' AND a.department.id = :deptId) " +
        "   OR (a.targetAudience = 'SPECIFIC' " +
        "       AND EXISTS (SELECT 1 FROM a.targetEmployees t WHERE t.id = :empId))) " +
        "ORDER BY a.isPinned DESC, a.publishDate DESC")
 List<Announcement> findForEmployee(
     @Param("empId") Long empId,
     @Param("deptId") Long deptId,
     @Param("now") LocalDateTime now);

 List<Announcement> findAllByOrderByCreatedAtDesc();

 @Modifying
 @Query("UPDATE Announcement a SET a.viewCount = a.viewCount + 1 " +
        "WHERE a.id = :id")
 void incrementViewCount(@Param("id") Long id);

 @Query("SELECT COUNT(a) FROM Announcement a WHERE a.isActive = true " +
        "AND (a.expiryDate IS NULL OR a.expiryDate > :now)")
 Long countActive(@Param("now") LocalDateTime now);
}