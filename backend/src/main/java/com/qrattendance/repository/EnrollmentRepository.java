package com.qrattendance.repository;

import com.qrattendance.model.Enrollment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface EnrollmentRepository extends JpaRepository<Enrollment, UUID> {
    List<Enrollment> findByStudentId(UUID studentId);
    List<Enrollment> findByClassEntityId(UUID classId);
    Optional<Enrollment> findByStudentIdAndClassEntityId(UUID studentId, UUID classId);
}
