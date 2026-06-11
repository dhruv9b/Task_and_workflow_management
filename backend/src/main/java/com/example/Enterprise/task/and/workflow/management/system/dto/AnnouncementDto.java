package com.example.Enterprise.task.and.workflow.management.system.dto;

import com.example.Enterprise.task.and.workflow.management.system.entity.Announcement;

import java.time.LocalDateTime;

public class AnnouncementDto {

    private Long id;
    private String title;
    private String message;
    private LocalDateTime createdAt;
    private String type; // For WebSocket events

    public static AnnouncementDto from(Announcement a) {
        AnnouncementDto dto = new AnnouncementDto();
        dto.setId(a.getId());
        dto.setTitle(a.getTitle());
        dto.setMessage(a.getMessage());
        dto.setCreatedAt(a.getCreatedAt());
        return dto;
    }

    // getters & setters
    public Long getId() {
        return id;
    }
    public void setId(Long id) {
        this.id = id;
    }
    public String getTitle() {
        return title;
    }
    public void setTitle(String title) {
        this.title = title;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    public String getMessage() {
        return message;
    }
    public void setMessage(String message) {
        this.message = message;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }
}

