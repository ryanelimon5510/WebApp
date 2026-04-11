package com.qrattendance.controller;

import com.qrattendance.model.Profile;
import com.qrattendance.model.RoleType;
import com.qrattendance.repository.ProfileRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private final ProfileRepository profileRepository;

    public AuthController(ProfileRepository profileRepository) {
        this.profileRepository = profileRepository;
    }

    /**
     * Register profile — called by frontend after Supabase signUp as a fallback
     * (the Supabase trigger normally handles this, but this ensures robustness)
     */
    @PostMapping("/register")
    public ResponseEntity<?> registerProfile(@RequestBody Map<String, String> payload) {
        String idStr = payload.get("id");
        if (idStr == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Missing user id"));
        }
        
        UUID userId = UUID.fromString(idStr);
        
        // Check if profile already exists (trigger may have already created it)
        if (profileRepository.findById(userId).isPresent()) {
            return ResponseEntity.ok(Map.of("message", "Profile already exists"));
        }

        Profile profile = new Profile();
        profile.setId(userId);
        profile.setFullName(payload.getOrDefault("fullName", "Unknown"));
        profile.setEmail(payload.getOrDefault("email", ""));
        profile.setRole(RoleType.valueOf(payload.getOrDefault("role", "STUDENT")));
        profile.setMobileNumber(payload.getOrDefault("mobileNumber", null));
        profile.setStudentNumber(payload.getOrDefault("studentNumber", null));
        
        profileRepository.save(profile);
        return ResponseEntity.ok(Map.of("message", "Profile created successfully"));
    }

    /**
     * Get the authenticated user's profile
     */
    @GetMapping("/me")
    public ResponseEntity<?> getProfile(@AuthenticationPrincipal Jwt jwt) {
        UUID userId = UUID.fromString(jwt.getSubject());
        return profileRepository.findById(userId)
            .<ResponseEntity<?>>map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }
}
