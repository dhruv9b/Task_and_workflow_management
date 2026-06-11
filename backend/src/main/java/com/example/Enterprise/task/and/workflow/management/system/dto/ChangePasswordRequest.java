package com.example.Enterprise.task.and.workflow.management.system.dto;

public class ChangePasswordRequest {
    String newPassword;
    String oldPassword;
    public String getNewPassword() {
        return newPassword;
    }
    public void setNewPassword(String newPassword) {
        this.newPassword = newPassword;
    }
    public String getOldPassword() {
        return oldPassword;
    }
    public void setOldPassword(String oldPassword) {
        this.oldPassword = oldPassword;
    }
}
