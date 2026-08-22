
//repository/PasswordResetTokenRepository.java
package com.hrms.repository;

import com.hrms.model.PasswordResetToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface PasswordResetTokenRepository
     extends JpaRepository<PasswordResetToken, Long> {

 Optional<PasswordResetToken> findByToken(String token);

 List<PasswordResetToken> findByUserIdAndIsUsedFalse(Long userId);

 // Invalidate all previous tokens for a user
 @Modifying
 @Query("UPDATE PasswordResetToken t SET t.isUsed = true, " +
        "t.usedAt = CURRENT_TIMESTAMP " +
        "WHERE t.user.id = :userId AND t.isUsed = false")
 void invalidateAllUserTokens(@Param("userId") Long userId);

 // Delete expired tokens (cleanup)
 @Modifying
 @Query("DELETE FROM PasswordResetToken t WHERE t.expiryDate < :now")
 void deleteExpiredTokens(@Param("now") LocalDateTime now);
}