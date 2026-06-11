package com.example.Enterprise.task.and.workflow.management.system.dto;

public class UpdateStatusRequest {
    private boolean active;

    public UpdateStatusRequest(boolean active) {
        this.active = active;
    }
    public boolean isActive() {
        return active;
    }
    public void setActive(boolean active) {
        this.active = active;
    }
}
