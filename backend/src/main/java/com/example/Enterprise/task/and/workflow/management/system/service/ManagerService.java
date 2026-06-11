package com.example.Enterprise.task.and.workflow.management.system.service;

import com.example.Enterprise.task.and.workflow.management.system.dto.AnnouncementDto;
import com.example.Enterprise.task.and.workflow.management.system.dto.UserDTO;
import com.example.Enterprise.task.and.workflow.management.system.entity.Announcement;
import com.example.Enterprise.task.and.workflow.management.system.entity.User;
import com.example.Enterprise.task.and.workflow.management.system.repository.AnnouncementRepository;
import com.example.Enterprise.task.and.workflow.management.system.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;
@Service
public class ManagerService {
    private final UserRepository userRepository;
    private final AnnouncementRepository repo;

    public ManagerService(UserRepository userRepository,AnnouncementRepository repo) {
        this.userRepository = userRepository;
        this.repo = repo;
    }
    public List<UserDTO> getMyTeam(Long managerId) {
        return userRepository.findByManager_IdAndDeletedFalse(managerId)
                .stream()
                .map(UserDTO::from)
                .toList();
    }
    public AnnouncementDto createAnnouncement(AnnouncementDto dto, String email) {
        User manager = userRepository.findByEmail(email)
                .orElseThrow();

        Announcement a = new Announcement();
        a.setTitle(dto.getTitle());
        a.setMessage(dto.getMessage());
        a.setManager(manager);

        Announcement saved = repo.save(a);
        return AnnouncementDto.from(saved);
    }
    public List<AnnouncementDto> getManagerAnnouncements(String email) {
        User manager = userRepository.findByEmail(email)
                .orElseThrow();

        return repo.findByManager_IdOrderByCreatedAtDesc(manager.getId())
                .stream()
                .map(AnnouncementDto::from)
                .toList();
    }
}
