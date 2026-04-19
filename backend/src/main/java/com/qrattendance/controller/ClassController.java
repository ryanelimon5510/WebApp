package com.qrattendance.controller;

import com.qrattendance.model.ClassEntity;
import com.qrattendance.model.Profile;
import com.qrattendance.repository.ClassRepository;
import com.qrattendance.repository.ProfileRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/classes")
@CrossOrigin(origins = "*")
public class ClassController {

    private final ClassRepository classRepository;
    private final ProfileRepository profileRepository;

    public ClassController(ClassRepository classRepository, ProfileRepository profileRepository) {
        this.classRepository = classRepository;
        this.profileRepository = profileRepository;
    }

    @PostMapping
    public ResponseEntity<?> createClass(@AuthenticationPrincipal Jwt jwt, @RequestBody Map<String, Object> payload) {
        try {
            UUID teacherId = UUID.fromString(jwt.getSubject());
            Profile teacher = profileRepository.findById(teacherId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Teacher profile not found"));
            
            ClassEntity classEntity = new ClassEntity();
            classEntity.setClassName((String) payload.get("className"));
            classEntity.setClassCode(((String) payload.get("classCode")).toUpperCase());
            classEntity.setTeacher(teacher);
            
            if (payload.get("roomLat") != null) {
                classEntity.setRoomLat(((Number) payload.get("roomLat")).doubleValue());
            }
            if (payload.get("roomLng") != null) {
                classEntity.setRoomLng(((Number) payload.get("roomLng")).doubleValue());
            }
            
            ClassEntity saved = classRepository.save(classEntity);
            return ResponseEntity.ok(saved);
        } catch (ResponseStatusException e) {
            throw e;
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("message", "Failed to create class: " + e.getMessage()));
        }
    }

    @GetMapping("/me")
    public ResponseEntity<List<ClassEntity>> getMyClasses(@AuthenticationPrincipal Jwt jwt) {
        UUID teacherId = UUID.fromString(jwt.getSubject());
        List<ClassEntity> classes = classRepository.findByTeacherId(teacherId);
        return ResponseEntity.ok(classes);
    }
}
