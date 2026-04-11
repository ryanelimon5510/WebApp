package com.qrattendance.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.util.UUID;
import java.time.ZonedDateTime;

@Entity
@Table(name = "enrollments", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"student_id", "class_id"})
})
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Enrollment {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "student_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Profile student;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "class_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private ClassEntity classEntity;

    @Column(name = "enrolled_at", insertable = false, updatable = false)
    private ZonedDateTime enrolledAt;

    // Getters and Setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public Profile getStudent() { return student; }
    public void setStudent(Profile student) { this.student = student; }
    public ClassEntity getClassEntity() { return classEntity; }
    public void setClassEntity(ClassEntity classEntity) { this.classEntity = classEntity; }
    public ZonedDateTime getEnrolledAt() { return enrolledAt; }
    public void setEnrolledAt(ZonedDateTime enrolledAt) { this.enrolledAt = enrolledAt; }
}
