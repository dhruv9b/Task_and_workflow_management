package com.example.Enterprise.task.and.workflow.management.system.auth;

public class LoginResponse {
    public LoginResponse(String token, String role,boolean forcePasswordChange,boolean active) {
        this.token = token;
        this.role = role;
        this.forcePasswordChange = forcePasswordChange;
        this.active = active;
    }
    private String token;
    private String role;
    private boolean forcePasswordChange;
    private boolean active;
    public String getToken() {
        return token;
    }
    public void setToken(String token) {
        this.token = token;
    }
    public String getRole() {
        return role;
    }
    public void setRole(String role) {
        this.role = role;
    }
    public boolean isForcePasswordChange() {
        return forcePasswordChange;
    }
    public void setForcePasswordChange(boolean forcePasswordChange) {
        this.forcePasswordChange = forcePasswordChange;
    }
    public boolean isActive() {
        return active;
    }
    public void setActive(boolean active) {
        this.active = active;
    }

}
