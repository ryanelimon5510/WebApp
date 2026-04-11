package com.qrattendance.controller;

import com.qrattendance.model.AttendanceLog;
import com.qrattendance.model.Profile;
import com.qrattendance.model.Session;
import com.qrattendance.model.StatusType;
import com.qrattendance.model.ClassEntity;
import com.qrattendance.repository.ClassRepository;
import com.qrattendance.repository.AttendanceLogRepository;
import com.qrattendance.repository.EnrollmentRepository;
import com.qrattendance.repository.ProfileRepository;
import com.qrattendance.repository.SessionRepository;
import com.qrattendance.service.GeofenceService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.server.ResponseStatusException;

import java.time.ZonedDateTime;
import java.util.Map;
import java.util.HashMap;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/attendance")
@CrossOrigin(origins = "*")
public class AttendanceController {

    private final SessionRepository sessionRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final ProfileRepository profileRepository;
    private final AttendanceLogRepository attendanceLogRepository;
    private final ClassRepository classRepository;
    private final GeofenceService geofenceService;
    private final SimpMessagingTemplate messagingTemplate;

    // 50 meters geofence radius
    private static final double MAX_DISTANCE_METERS = 50.0;

    public AttendanceController(SessionRepository sessionRepository,
                                EnrollmentRepository enrollmentRepository,
                                ProfileRepository profileRepository,
                                AttendanceLogRepository attendanceLogRepository,
                                ClassRepository classRepository,
                                GeofenceService geofenceService,
                                SimpMessagingTemplate messagingTemplate) {
        this.sessionRepository = sessionRepository;
        this.enrollmentRepository = enrollmentRepository;
        this.profileRepository = profileRepository;
        this.attendanceLogRepository = attendanceLogRepository;
        this.classRepository = classRepository;
        this.geofenceService = geofenceService;
        this.messagingTemplate = messagingTemplate;
    }

    @PostMapping("/verify")
    public ResponseEntity<?> verifyAttendance(@AuthenticationPrincipal Jwt jwt, @RequestBody Map<String, Object> payload) {
        String token = (String) payload.get("token");
        Double lat = ((Number) payload.get("lat")).doubleValue();
        Double lng = ((Number) payload.get("lng")).doubleValue();
        UUID studentId = UUID.fromString(jwt.getSubject());

        // 1. Token valid and not expired?
        Session session = sessionRepository.findByActiveQrToken(token)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid or expired QR token"));
            
        if (!session.getIsActive() || ZonedDateTime.now().isAfter(session.getTokenExpiry())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "QR Token has expired. Please wait for the teacher's screen to refresh.");
        }

        // 2. Already scanned?
        if (attendanceLogRepository.findBySessionIdAndStudentId(session.getId(), studentId).isPresent()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Attendance already recorded for this session");
        }

        // 3. Enrolled?
        if (enrollmentRepository.findByStudentIdAndClassEntityId(studentId, session.getClassEntity().getId()).isEmpty()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You are not enrolled in this class");
        }

        Profile student = profileRepository.findById(studentId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Student profile not found"));

        // 4. Geofence Check
        Double roomLat = session.getClassEntity().getRoomLat();
        Double roomLng = session.getClassEntity().getRoomLng();
        double distance = geofenceService.calculateDistance(lat, lng, roomLat, roomLng);

        AttendanceLog log = new AttendanceLog();
        log.setSession(session);
        log.setStudent(student);
        log.setStudentLat(lat);
        log.setStudentLng(lng);
        log.setDistanceMeters(distance);

        if (distance <= MAX_DISTANCE_METERS) {
            log.setStatus(StatusType.PRESENT);
            attendanceLogRepository.save(log);

            // Send Realtime Update via WebSocket
            Map<String, Object> wsPayload = new HashMap<>();
            wsPayload.put("studentName", student.getFullName());
            wsPayload.put("status", "PRESENT");
            wsPayload.put("distance", Math.round(distance));
            messagingTemplate.convertAndSend("/topic/session/" + session.getId(), wsPayload);

            Map<String, String> response = new HashMap<>();
            response.put("message", "Attendance recorded successfully! Distance: " + Math.round(distance) + "m");
            response.put("status", "PRESENT");
            return ResponseEntity.ok(response);
        } else {
            log.setStatus(StatusType.REJECTED);
            attendanceLogRepository.save(log);
            
            // Notify teacher of rejected scans
            Map<String, Object> wsPayload = new HashMap<>();
            wsPayload.put("studentName", student.getFullName());
            wsPayload.put("status", "REJECTED");
            wsPayload.put("distance", Math.round(distance));
            messagingTemplate.convertAndSend("/topic/session/" + session.getId(), wsPayload);

            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("message", "You are too far from the classroom. Distance: " + Math.round(distance) + "m");
            errorResponse.put("status", "REJECTED");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }

    @GetMapping("/class/{classId}")
    public ResponseEntity<List<AttendanceLog>> getClassLogs(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID classId) {
        // Check teacher ownership
        ClassEntity cls = classRepository.findById(classId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Class not found"));
        if (!cls.getTeacher().getId().equals(UUID.fromString(jwt.getSubject()))) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not your class");
        }
        
        // Use proper JPQL query instead of loading all + filtering in memory
        List<AttendanceLog> logs = attendanceLogRepository.findByClassId(classId);
        return ResponseEntity.ok(logs);
    }
}
