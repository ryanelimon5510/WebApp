package com.qrattendance.repository;

import com.qrattendance.model.AttendanceLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.UUID;
import java.util.Optional;
import java.util.List;

public interface AttendanceLogRepository extends JpaRepository<AttendanceLog, UUID> {
    Optional<AttendanceLog> findBySessionIdAndStudentId(UUID sessionId, UUID studentId);
    
    @Query("SELECT a FROM AttendanceLog a WHERE a.session.classEntity.id = :classId ORDER BY a.scanTime DESC")
    List<AttendanceLog> findByClassId(@Param("classId") UUID classId);
}
