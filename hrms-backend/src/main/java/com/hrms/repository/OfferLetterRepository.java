
//repository/OfferLetterRepository.java
package com.hrms.repository;

import com.hrms.model.OfferLetter;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OfferLetterRepository extends JpaRepository<OfferLetter, Long> {

 List<OfferLetter> findAllByOrderByCreatedAtDesc();

 Optional<OfferLetter> findByOfferNumber(String offerNumber);

 List<OfferLetter> findByStatusOrderByCreatedAtDesc(OfferLetter.Status status);

 @Query("SELECT COUNT(o) FROM OfferLetter o WHERE o.status = :status")
 Long countByStatus(@Param("status") OfferLetter.Status status);

 boolean existsByOfferNumber(String offerNumber);
}