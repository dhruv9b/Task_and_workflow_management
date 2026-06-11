package com.example.Enterprise.task.and.workflow.management.system.dto;

import com.example.Enterprise.task.and.workflow.management.system.entity.User;

public class UserDTO {

    private Long id;
    private String email;
    private String role;
    private boolean active;
    private Long managerId;
    private String name;
    public static UserDTO from(User user) {
        UserDTO dto = new UserDTO();
        dto.setId(user.getId());
        dto.setEmail(user.getEmail());
        dto.setRole(user.getRole().name());
        dto.setActive(user.isActive());
        dto.setName(user.getName());

        if (user.getManager() != null) {
            dto.setManagerId(user.getManager().getId());
        }

        return dto;
    }

    // getters & setters
    public String getName() {
        return name;
    }
    public void setName(String name) {
        this.name = name;
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
    public String getRole() {
        return role;
    }
    public void setRole(String role) {
        this.role = role;
    }
    public boolean isActive() {
        return active;
    }
    public void setActive(boolean active) {
        this.active = active;
    }
    public Long getManagerId() {
        return managerId;
    }
    public void setManagerId(Long managerId) {
        this.managerId = managerId;
    }
}

