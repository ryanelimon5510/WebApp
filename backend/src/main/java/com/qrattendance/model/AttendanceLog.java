package com.qrattendance.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.util.UUID;
import java.time.ZonedDateTime;

@Entity
@Table(name = "attendance_logs", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"session_id", "student_id"})
})
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class AttendanceLog {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "session_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Session session;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "student_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Profile student;

    @Column(name = "scan_time", insertable = false, updatable = false)
    private ZonedDateTime scanTime;

    @Column(name = "student_lat")
    private Double studentLat;

    @Column(name = "student_lng")
    private Double studentLng;

    @Column(name = "distance_meters")
    private Double distanceMeters;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatusType status;

    // Getters and Setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public Session getSession() { return session; }
    public void setSession(Session session) { this.session = session; }
    public Profile getStudent() { return student; }
    public void setStudent(Profile student) { this.student = student; }
    public ZonedDateTime getScanTime() { return scanTime; }
    public void setScanTime(ZonedDateTime scanTime) { this.scanTime = scanTime; }
    public Double getStudentLat() { return studentLat; }
    public void setStudentLat(Double studentLat) { this.studentLat = studentLat; }
    public Double getStudentLng() { return studentLng; }
    public void setStudentLng(Double studentLng) { this.studentLng = studentLng; }
    public Double getDistanceMeters() { return distanceMeters; }
    public void setDistanceMeters(Double distanceMeters) { this.distanceMeters = distanceMeters; }
    public StatusType getStatus() { return status; }
    public void setStatus(StatusType status) { this.status = status; }
}
