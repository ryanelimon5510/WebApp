package com.qrattendance.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.util.UUID;
import java.time.ZonedDateTime;

@Entity
@Table(name = "profiles")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Profile {

    @Id
    private UUID id;

    @Column(name = "full_name", nullable = false)
    private String fullName;

    @Column(unique = true, nullable = false)
    private String email;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RoleType role = RoleType.STUDENT;

    @Column(name = "student_number")
    private String studentNumber;

    @Column(name = "mobile_number")
    private String mobileNumber;

    @Column(name = "created_at", insertable = false, updatable = false)
    private ZonedDateTime createdAt;

    // Getters and Setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public RoleType getRole() { return role; }
    public void setRole(RoleType role) { this.role = role; }
    public String getStudentNumber() { return studentNumber; }
    public void setStudentNumber(String studentNumber) { this.studentNumber = studentNumber; }
    public String getMobileNumber() { return mobileNumber; }
    public void setMobileNumber(String mobileNumber) { this.mobileNumber = mobileNumber; }
    public ZonedDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(ZonedDateTime createdAt) { this.createdAt = createdAt; }
}
