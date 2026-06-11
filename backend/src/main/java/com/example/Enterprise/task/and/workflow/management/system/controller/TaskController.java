package com.example.Enterprise.task.and.workflow.management.system.controller;

import com.example.Enterprise.task.and.workflow.management.system.dto.TaskDto;
import com.example.Enterprise.task.and.workflow.management.system.dto.TaskStatsDto;
import com.example.Enterprise.task.and.workflow.management.system.dto.TaskUpdateDTO;
import com.example.Enterprise.task.and.workflow.management.system.service.TaskService;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/tasks")
public class TaskController {
    private final TaskService taskService;
    private final TaskWebSocketController taskWebSocketController;

    public TaskController(TaskService taskService, TaskWebSocketController taskWebSocketController) {
        this.taskService = taskService;
        this.taskWebSocketController = taskWebSocketController;
    }

    @PostMapping(value = "/assign", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<TaskDto> assignTask(
            @RequestParam("employeeId") Long employeeId,
            @RequestParam("title") String title,
            @RequestParam("description") String description,
            @RequestParam("deadline") String deadline,
            @RequestParam(value = "file", required = false) MultipartFile file,
            Authentication authentication) {

        TaskDto assigned = taskService.assignTask(authentication.getName(), employeeId, title, description, file, deadline);
        
        // Broadcast via WebSocket to employee
        TaskUpdateDTO update = new TaskUpdateDTO();
        update.setType("TASK_ASSIGNED");
        update.setTaskId(assigned.getId());
        update.setTaskTitle(assigned.getTitle());
        update.setEmployeeId(employeeId);
        update.setAssignedBy(assigned.getAssignedByName());
        update.setDeadline(deadline);
        update.setEventType("TASK_ASSIGNED");
        
        taskWebSocketController.handleTaskUpdate(update);
        
        return ResponseEntity.ok(assigned);
    }

    @GetMapping("/assigned")
    @PreAuthorize("hasRole('EMPLOYEE')")
    public ResponseEntity<List<TaskDto>> getAssignedTasks(Authentication authentication) {
        List<TaskDto> tasks = taskService.getEmployeeTasks(authentication.getName());
        return ResponseEntity.ok(tasks);
    }

    @GetMapping("/manager-tasks")
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<List<TaskDto>> getManagerTasks(Authentication authentication) {
        List<TaskDto> tasks = taskService.getManagerTeamTasks(authentication.getName());
        return ResponseEntity.ok(tasks);
    }

    @PutMapping("/{taskId}/complete")
    @PreAuthorize("hasRole('EMPLOYEE')")
    public ResponseEntity<TaskDto> completeTask(
            @PathVariable Long taskId,
            Authentication authentication) {

        TaskDto updated = taskService.markTaskAsDone(authentication.getName(), taskId);
        
        // Broadcast via WebSocket to manager
        TaskUpdateDTO update = new TaskUpdateDTO();
        update.setType("TASK_COMPLETED");
        update.setTaskId(updated.getId());
        update.setTaskTitle(updated.getTitle());
        update.setCompletedBy(updated.getAssignedToName());
        update.setCompletedAt(updated.getCompletedAt());
        update.setEventType("TASK_COMPLETED");
        
        taskWebSocketController.handleTaskUpdate(update);
        
        return ResponseEntity.ok(updated);
    }

    @GetMapping("/stats")
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<TaskStatsDto> getTaskStats(Authentication authentication) {
        TaskStatsDto stats = taskService.getTaskStats(authentication.getName());
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/{taskId}/download")
    public ResponseEntity<Resource> downloadAttachment(
            @PathVariable Long taskId,
            Authentication authentication) {

        Resource resource = taskService.downloadTaskFile(taskId, authentication.getName());
        String contentType = "application/octet-stream";

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + resource.getFilename().substring(resource.getFilename().indexOf("_") + 1) + "\"")
                .body(resource);
    }
}
