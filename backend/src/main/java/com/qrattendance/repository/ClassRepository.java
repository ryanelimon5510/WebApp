package com.qrattendance.repository;

import com.qrattendance.model.ClassEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ClassRepository extends JpaRepository<ClassEntity, UUID> {
    List<ClassEntity> findByTeacherId(UUID teacherId);
    Optional<ClassEntity> findByClassCode(String classCode);
}
