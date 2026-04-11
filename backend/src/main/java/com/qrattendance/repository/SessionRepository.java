package com.qrattendance.repository;

import com.qrattendance.model.Session;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface SessionRepository extends JpaRepository<Session, UUID> {
    List<Session> findByClassEntityIdAndIsActiveTrue(UUID classId);
    Optional<Session> findByActiveQrToken(String activeQrToken);
}
