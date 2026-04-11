package com.qrattendance.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.util.UUID;
import java.time.ZonedDateTime;

@Entity
@Table(name = "classes")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class ClassEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "class_code", unique = true, nullable = false)
    private String classCode;

    @Column(name = "class_name", nullable = false)
    private String className;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "teacher_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Profile teacher;

    @Column(name = "room_lat")
    private Double roomLat;

    @Column(name = "room_lng")
    private Double roomLng;

    @Column(name = "created_at", insertable = false, updatable = false)
    private ZonedDateTime createdAt;

    // Getters and Setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public String getClassCode() { return classCode; }
    public void setClassCode(String classCode) { this.classCode = classCode; }
    public String getClassName() { return className; }
    public void setClassName(String className) { this.className = className; }
    public Profile getTeacher() { return teacher; }
    public void setTeacher(Profile teacher) { this.teacher = teacher; }
    public Double getRoomLat() { return roomLat; }
    public void setRoomLat(Double roomLat) { this.roomLat = roomLat; }
    public Double getRoomLng() { return roomLng; }
    public void setRoomLng(Double roomLng) { this.roomLng = roomLng; }
    public ZonedDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(ZonedDateTime createdAt) { this.createdAt = createdAt; }
}
