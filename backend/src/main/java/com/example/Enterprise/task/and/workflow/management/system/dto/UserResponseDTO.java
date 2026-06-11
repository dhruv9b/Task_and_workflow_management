package com.example.Enterprise.task.and.workflow.management.system.dto;

import com.example.Enterprise.task.and.workflow.management.system.entity.Role;
import java.time.LocalDateTime;

public class UserResponseDTO {
    private Long id;
    private String email;
    private Role role;
    private boolean active;
    private LocalDateTime lastLogin;
    private String name;

    public UserResponseDTO() {}

    public UserResponseDTO(Long id, String email, Role role, String name, boolean active, LocalDateTime lastLogin) {
        this.id = id;
        this.email = email;
        this.role = role;
        this.name = name;
        this.active = active;
        this.lastLogin = lastLogin;
    }

    public String getName() {
        return name;
    }
    public void setName(String name) {
        this.name = name;
    }

    public LocalDateTime getLastLogin() {
        return lastLogin;
    }

    public void setLastLogin(LocalDateTime lastLogin) {
        this.lastLogin = lastLogin;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }
}
