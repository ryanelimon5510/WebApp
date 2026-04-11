package com.qrattendance.controller;

import com.qrattendance.model.ClassEntity;
import com.qrattendance.model.Session;
import com.qrattendance.repository.ClassRepository;
import com.qrattendance.repository.SessionRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.ZonedDateTime;
import java.util.UUID;
import java.util.Map;
import java.util.HashMap;
import java.util.List;

@RestController
@RequestMapping("/api/sessions")
@CrossOrigin(origins = "*")
public class SessionController {

    private final SessionRepository sessionRepository;
    private final ClassRepository classRepository;

    public SessionController(SessionRepository sessionRepository, ClassRepository classRepository) {
        this.sessionRepository = sessionRepository;
        this.classRepository = classRepository;
    }

    @PostMapping("/start/{classId}")
    public ResponseEntity<Map<String, Object>> startSession(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID classId) {
        try {
            System.out.println("[SESSION] Starting session for class: " + classId + " by user: " + jwt.getSubject());
            
            ClassEntity classEntity = classRepository.findById(classId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Class not found"));

            if (!classEntity.getTeacher().getId().equals(UUID.fromString(jwt.getSubject()))) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not your class");
            }
            
            // Deactivate ALL existing active sessions for this class
            List<Session> activeSessions = sessionRepository.findByClassEntityIdAndIsActiveTrue(classId);
            for (Session existing : activeSessions) {
                existing.setIsActive(false);
                existing.setEndedAt(ZonedDateTime.now());
                sessionRepository.save(existing);
            }

            Session newSession = new Session();
            newSession.setClassEntity(classEntity);
            newSession.setActiveQrToken(UUID.randomUUID().toString());
            newSession.setTokenExpiry(ZonedDateTime.now().plusSeconds(15));
            Session saved = sessionRepository.save(newSession);
            
            Map<String, Object> response = new HashMap<>();
            response.put("id", saved.getId().toString());
            response.put("activeQrToken", saved.getActiveQrToken());
            response.put("isActive", saved.getIsActive());
            System.out.println("[SESSION] Session started successfully: " + saved.getId());
            return ResponseEntity.ok(response);
        } catch (ResponseStatusException e) {
            throw e;
        } catch (Exception e) {
            System.err.println("[SESSION ERROR] Failed to start session: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", e.getMessage() != null ? e.getMessage() : "Unknown error"));
        }
    }

    @PostMapping("/refresh/{sessionId}")
    public ResponseEntity<Map<String, String>> refreshToken(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID sessionId) {
        Session session = sessionRepository.findById(sessionId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Session not found"));

        if (!session.getClassEntity().getTeacher().getId().equals(UUID.fromString(jwt.getSubject()))) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not your session");
        }

        if (!session.getIsActive()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Session already ended");
        }

        session.setActiveQrToken(UUID.randomUUID().toString());
        session.setTokenExpiry(ZonedDateTime.now().plusSeconds(15));
        sessionRepository.save(session);
        
        Map<String, String> response = new HashMap<>();
        response.put("token", session.getActiveQrToken());
        response.put("expiry", session.getTokenExpiry().toString());
        
        return ResponseEntity.ok(response);
    }

    @PostMapping("/stop/{sessionId}")
    public ResponseEntity<Map<String, String>> stopSession(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID sessionId) {
        Session session = sessionRepository.findById(sessionId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Session not found"));

        if (!session.getClassEntity().getTeacher().getId().equals(UUID.fromString(jwt.getSubject()))) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not your session");
        }

        session.setIsActive(false);
        session.setEndedAt(ZonedDateTime.now());
        sessionRepository.save(session);

        Map<String, String> response = new HashMap<>();
        response.put("message", "Session ended successfully");
        return ResponseEntity.ok(response);
    }
}
