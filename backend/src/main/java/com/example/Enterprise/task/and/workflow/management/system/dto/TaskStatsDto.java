package com.example.Enterprise.task.and.workflow.management.system.dto;

import java.util.List;

public class TaskStatsDto {
    private int totalTasks;
    private int completedTasks;
    private int pendingTasks;
    
    private int doneBeforeDeadlineCount;
    private double doneBeforeDeadlinePercentage;
    
    private int doneAfterDeadlineCount;
    private double doneAfterDeadlinePercentage;
    
    private int notCompletedCount;
    private double notCompletedPercentage;
    
    private List<TaskDto> taskHistory;

    public TaskStatsDto() {
    }

    // Getters and Setters
    public int getTotalTasks() {
        return totalTasks;
    }

    public void setTotalTasks(int totalTasks) {
        this.totalTasks = totalTasks;
    }

    public int getCompletedTasks() {
        return completedTasks;
    }

    public void setCompletedTasks(int completedTasks) {
        this.completedTasks = completedTasks;
    }

    public int getPendingTasks() {
        return pendingTasks;
    }

    public void setPendingTasks(int pendingTasks) {
        this.pendingTasks = pendingTasks;
    }

    public int getDoneBeforeDeadlineCount() {
        return doneBeforeDeadlineCount;
    }

    public void setDoneBeforeDeadlineCount(int doneBeforeDeadlineCount) {
        this.doneBeforeDeadlineCount = doneBeforeDeadlineCount;
    }

    public double getDoneBeforeDeadlinePercentage() {
        return doneBeforeDeadlinePercentage;
    }

    public void setDoneBeforeDeadlinePercentage(double doneBeforeDeadlinePercentage) {
        this.doneBeforeDeadlinePercentage = doneBeforeDeadlinePercentage;
    }

    public int getDoneAfterDeadlineCount() {
        return doneAfterDeadlineCount;
    }

    public void setDoneAfterDeadlineCount(int doneAfterDeadlineCount) {
        this.doneAfterDeadlineCount = doneAfterDeadlineCount;
    }

    public double getDoneAfterDeadlinePercentage() {
        return doneAfterDeadlinePercentage;
    }

    public void setDoneAfterDeadlinePercentage(double doneAfterDeadlinePercentage) {
        this.doneAfterDeadlinePercentage = doneAfterDeadlinePercentage;
    }

    public int getNotCompletedCount() {
        return notCompletedCount;
    }

    public void setNotCompletedCount(int notCompletedCount) {
        this.notCompletedCount = notCompletedCount;
    }

    public double getNotCompletedPercentage() {
        return notCompletedPercentage;
    }

    public void setNotCompletedPercentage(double notCompletedPercentage) {
        this.notCompletedPercentage = notCompletedPercentage;
    }

    public List<TaskDto> getTaskHistory() {
        return taskHistory;
    }

    public void setTaskHistory(List<TaskDto> taskHistory) {
        this.taskHistory = taskHistory;
    }
}
