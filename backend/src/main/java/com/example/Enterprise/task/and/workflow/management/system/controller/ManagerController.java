package com.example.Enterprise.task.and.workflow.management.system.controller;

import com.example.Enterprise.task.and.workflow.management.system.dto.AnnouncementDto;
import com.example.Enterprise.task.and.workflow.management.system.dto.UserDTO;
import com.example.Enterprise.task.and.workflow.management.system.entity.User;
import com.example.Enterprise.task.and.workflow.management.system.repository.UserRepository;
import com.example.Enterprise.task.and.workflow.management.system.service.ManagerService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/manager")
@PreAuthorize("hasRole('MANAGER')")
public class ManagerController {
    private final ManagerService managerService;
    private final UserRepository userRepository;
    private final AnnouncementWebSocketController announcementWebSocketController;

    public ManagerController(ManagerService managerService,
                             UserRepository userRepository,
                             AnnouncementWebSocketController announcementWebSocketController) {
        this.managerService = managerService;
        this.userRepository = userRepository;
        this.announcementWebSocketController = announcementWebSocketController;
    }
    @GetMapping("/team")
    public List<UserDTO> getTeam(Authentication authentication) {

        String email = authentication.getName();
        User manager = userRepository.findByEmail(email).orElseThrow();

        return managerService.getMyTeam(manager.getId());
    }
    @PostMapping("/announcements")
    public ResponseEntity<?> create(
            @RequestBody AnnouncementDto dto,
            Authentication authentication) {

        AnnouncementDto created = managerService.createAnnouncement(dto, authentication.getName());
        
        // Broadcast via WebSocket to employees
        AnnouncementDto broadcastDto = new AnnouncementDto();
        broadcastDto.setId(created.getId());
        broadcastDto.setType("ANNOUNCEMENT_CREATED");
        broadcastDto.setTitle(created.getTitle());
        broadcastDto.setMessage(created.getMessage());
        broadcastDto.setCreatedAt(created.getCreatedAt());
        
        announcementWebSocketController.broadcastToEmployees(broadcastDto);
        
        return ResponseEntity.ok(created);
    }

    @GetMapping("/announcements")
    public List<AnnouncementDto> myAnnouncements(Authentication authentication) {
        return managerService.getManagerAnnouncements(authentication.getName());
    }

}
