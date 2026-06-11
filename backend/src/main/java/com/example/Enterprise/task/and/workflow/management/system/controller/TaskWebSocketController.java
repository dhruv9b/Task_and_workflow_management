package com.example.Enterprise.task.and.workflow.management.system.controller;

import com.example.Enterprise.task.and.workflow.management.system.dto.TaskUpdateDTO;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Controller
public class TaskWebSocketController {

    private final SimpMessagingTemplate messagingTemplate;

    public TaskWebSocketController(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    // Handle task updates
    @MessageMapping("/task")
    public void handleTaskUpdate(TaskUpdateDTO taskUpdate) {
        // Broadcast to appropriate audience based on event type
        if ("TASK_ASSIGNED".equals(taskUpdate.getType()) || "TASK_ASSIGNED".equals(taskUpdate.getEventType())) {
            // Send to employee
            messagingTemplate.convertAndSend("/topic/employee/tasks", taskUpdate);
        } else if ("TASK_COMPLETED".equals(taskUpdate.getType()) || "TASK_COMPLETED".equals(taskUpdate.getEventType())) {
            // Send to manager
            messagingTemplate.convertAndSend("/topic/manager/tasks", taskUpdate);
        }
    }
}
