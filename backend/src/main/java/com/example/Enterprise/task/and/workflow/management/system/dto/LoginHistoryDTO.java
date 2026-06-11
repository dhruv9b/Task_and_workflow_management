package com.example.Enterprise.task.and.workflow.management.system.dto;

import com.example.Enterprise.task.and.workflow.management.system.entity.LoginHistory;
import java.time.LocalDateTime;

public class LoginHistoryDTO {
    private Long id;
    private Long userId;
    private String userEmail;
    private String userName;
    private LoginHistory.EventType eventType;
    private LocalDateTime eventTime;

    public LoginHistoryDTO() {}

    public LoginHistoryDTO(Long id, Long userId, String userEmail, String userName, 
                          LoginHistory.EventType eventType, LocalDateTime eventTime) {
        this.id = id;
        this.userId = userId;
        this.userEmail = userEmail;
        this.userName = userName;
        this.eventType = eventType;
        this.eventTime = eventTime;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getUserEmail() {
        return userEmail;
    }

    public void setUserEmail(String userEmail) {
        this.userEmail = userEmail;
    }

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public LoginHistory.EventType getEventType() {
        return eventType;
    }

    public void setEventType(LoginHistory.EventType eventType) {
        this.eventType = eventType;
    }

    public LocalDateTime getEventTime() {
        return eventTime;
    }

    public void setEventTime(LocalDateTime eventTime) {
        this.eventTime = eventTime;
    }
}
