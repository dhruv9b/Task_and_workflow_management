package com.example.Enterprise.task.and.workflow.management.system.service;

import com.example.Enterprise.task.and.workflow.management.system.dto.AnnouncementDto;
import com.example.Enterprise.task.and.workflow.management.system.entity.User;
import com.example.Enterprise.task.and.workflow.management.system.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.RequestMapping;

import java.util.List;


@Service
public class EmployeeService {
    private final ManagerService managerService;
    private final UserRepository userRepository;
    public EmployeeService(ManagerService managerService,
                           UserRepository userRepository) {
        this.managerService = managerService;
        this.userRepository = userRepository;
    }
    public List<AnnouncementDto> announcements(Authentication auth){
        User user = userRepository.findByEmail(auth.getName()).orElseThrow();

        // If user is a manager, get their own announcements
        if (user.getRole().name().equals("MANAGER")) {
            return managerService.getManagerAnnouncements(user.getEmail());
        }

        // If user is an employee, get their manager's announcements
        if (user.getManager() == null) return List.of();

        return managerService.getManagerAnnouncements(user.getManager().getEmail());
    }
}
