
// repository/CandidateRepository.java
package com.hrms.repository;

import com.hrms.model.Candidate;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface CandidateRepository extends JpaRepository<Candidate, Long> {
    Optional<Candidate> findByEmail(String email);
    List<Candidate> findAllByOrderByCreatedAtDesc();
}