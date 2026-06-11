package com.example.Enterprise.task.and.workflow.management.system.controller;

import com.example.Enterprise.task.and.workflow.management.system.dto.AnnouncementDto;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Controller
public class AnnouncementWebSocketController {

    private final SimpMessagingTemplate messagingTemplate;

    public AnnouncementWebSocketController(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    // Handle announcement creation from manager
    @MessageMapping("/announcement")
    @SendTo("/topic/manager/announcements")
    public AnnouncementDto handleAnnouncement(AnnouncementDto announcement) {
        return announcement;
    }

    // Method to broadcast announcement to employees
    public void broadcastToEmployees(AnnouncementDto announcement) {
        messagingTemplate.convertAndSend("/topic/employee/announcements", announcement);
    }
}
