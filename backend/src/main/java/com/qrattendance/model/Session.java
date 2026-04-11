package com.qrattendance.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.util.UUID;
import java.time.ZonedDateTime;

@Entity
@Table(name = "sessions")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Session {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "class_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private ClassEntity classEntity;

    @Column(name = "active_qr_token", nullable = false)
    private String activeQrToken;

    @Column(name = "token_expiry", nullable = false)
    private ZonedDateTime tokenExpiry;

    @Column(name = "is_active")
    private Boolean isActive = true;

    @Column(name = "started_at", insertable = false, updatable = false)
    private ZonedDateTime startedAt;

    @Column(name = "ended_at")
    private ZonedDateTime endedAt;

    // Getters and Setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public ClassEntity getClassEntity() { return classEntity; }
    public void setClassEntity(ClassEntity classEntity) { this.classEntity = classEntity; }
    public String getActiveQrToken() { return activeQrToken; }
    public void setActiveQrToken(String activeQrToken) { this.activeQrToken = activeQrToken; }
    public ZonedDateTime getTokenExpiry() { return tokenExpiry; }
    public void setTokenExpiry(ZonedDateTime tokenExpiry) { this.tokenExpiry = tokenExpiry; }
    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }
    public ZonedDateTime getStartedAt() { return startedAt; }
    public void setStartedAt(ZonedDateTime startedAt) { this.startedAt = startedAt; }
    public ZonedDateTime getEndedAt() { return endedAt; }
    public void setEndedAt(ZonedDateTime endedAt) { this.endedAt = endedAt; }
}
