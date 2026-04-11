package com.qrattendance.controller;

import com.qrattendance.model.ClassEntity;
import com.qrattendance.model.Enrollment;
import com.qrattendance.model.Profile;
import com.qrattendance.repository.ClassRepository;
import com.qrattendance.repository.EnrollmentRepository;
import com.qrattendance.repository.ProfileRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;
import java.util.Map;

@RestController
@RequestMapping("/api/enrollments")
@CrossOrigin(origins = "*")
public class EnrollmentController {

    private final EnrollmentRepository enrollmentRepository;
    private final ClassRepository classRepository;
    private final ProfileRepository profileRepository;

    public EnrollmentController(EnrollmentRepository enrollmentRepository, 
                                ClassRepository classRepository, 
                                ProfileRepository profileRepository) {
        this.enrollmentRepository = enrollmentRepository;
        this.classRepository = classRepository;
        this.profileRepository = profileRepository;
    }

    @PostMapping("/join")
    public ResponseEntity<Enrollment> joinClass(@AuthenticationPrincipal Jwt jwt, @RequestBody Map<String, String> payload) {
        String classCode = payload.get("classCode");
        UUID studentId = UUID.fromString(jwt.getSubject());

        Profile student = profileRepository.findById(studentId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Student profile not found"));

        ClassEntity classEntity = classRepository.findByClassCode(classCode)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Invalid class code"));

        if (enrollmentRepository.findByStudentIdAndClassEntityId(studentId, classEntity.getId()).isPresent()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Already enrolled in this class");
        }

        Enrollment enrollment = new Enrollment();
        enrollment.setStudent(student);
        enrollment.setClassEntity(classEntity);
        
        return ResponseEntity.ok(enrollmentRepository.save(enrollment));
    }

    @GetMapping("/me")
    public ResponseEntity<List<Enrollment>> getMyEnrollments(@AuthenticationPrincipal Jwt jwt) {
        UUID studentId = UUID.fromString(jwt.getSubject());
        List<Enrollment> enrollments = enrollmentRepository.findByStudentId(studentId);
        return ResponseEntity.ok(enrollments);
    }
}
