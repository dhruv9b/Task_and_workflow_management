package com.example.Enterprise.task.and.workflow.management.system.service;

import com.example.Enterprise.task.and.workflow.management.system.dto.LoginHistoryDTO;
import com.example.Enterprise.task.and.workflow.management.system.entity.LoginHistory;
import com.example.Enterprise.task.and.workflow.management.system.entity.Role;
import com.example.Enterprise.task.and.workflow.management.system.entity.User;
import com.example.Enterprise.task.and.workflow.management.system.repository.LoginHistoryRepository;
import com.example.Enterprise.task.and.workflow.management.system.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import java.util.stream.Stream;
import java.util.Comparator;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class LoginHistoryService {

    private final LoginHistoryRepository loginHistoryRepository;
    private final UserRepository userRepository;

    public LoginHistoryService(LoginHistoryRepository loginHistoryRepository, UserRepository userRepository) {
        this.loginHistoryRepository = loginHistoryRepository;
        this.userRepository = userRepository;
    }

    public Page<LoginHistoryDTO> getLoginHistory(Authentication authentication, int page, int size) {
        User currentUser = getCurrentUser(authentication);
        
        Pageable pageable = PageRequest.of(page, size);
        Page<LoginHistory> history;

        switch (currentUser.getRole()) {
            case ADMIN:
                // Admin can see all login history
                history = loginHistoryRepository.findByEventTypeOrderByEventTimeDesc(
                    LoginHistory.EventType.LOGIN, pageable);
                break;
            case MANAGER:
                // Manager sees both own login history and their team's login history
                // Fetch team history
                Page<LoginHistory> teamHistory = loginHistoryRepository.findByUserManagerAndEventTypeOrderByEventTimeDesc(
                    currentUser, LoginHistory.EventType.LOGIN, pageable);
                // Fetch manager's own history (as a list)
                List<LoginHistory> selfHistoryList = loginHistoryRepository.findByUserAndEventTypeOrderByEventTimeDesc(
                    currentUser, LoginHistory.EventType.LOGIN);
                // Combine and sort by eventTime descending
                List<LoginHistory> combined = Stream.concat(teamHistory.getContent().stream(), selfHistoryList.stream())
                    .sorted(Comparator.comparing(LoginHistory::getEventTime).reversed())
                    .collect(Collectors.toList());
                history = new PageImpl<>(combined, pageable, combined.size());
                break;
            case EMPLOYEE:
                // Employee can only see their own login history
                history = loginHistoryRepository.findByUserOrderByEventTimeDesc(currentUser, pageable);
                break;
            default:
                throw new RuntimeException("Unauthorized role");
        }

        return history.map(this::convertToDTO);
    }

    public Page<LoginHistoryDTO> getAllHistory(Authentication authentication, int page, int size) {
        User currentUser = getCurrentUser(authentication);
        
        if (currentUser.getRole() != Role.ADMIN && currentUser.getRole() != Role.MANAGER) {
            throw new RuntimeException("Unauthorized: Only admin and manager can view all history");
        }

        Pageable pageable = PageRequest.of(page, size);
        Page<LoginHistory> history;

        if (currentUser.getRole() == Role.ADMIN) {
            // Admin can see all history
            history = loginHistoryRepository.findAllByOrderByEventTimeDesc(pageable);
        } else {
            // Manager sees both own login history and their team's login history
            // Fetch team history
            Page<LoginHistory> teamHistory = loginHistoryRepository.findByUserManagerOrderByEventTimeDesc(currentUser, pageable);
            // Fetch manager's own history (as a list)
            List<LoginHistory> selfHistoryList = loginHistoryRepository.findByUserAndEventTypeOrderByEventTimeDesc(
                currentUser, LoginHistory.EventType.LOGIN);
            // Combine and sort by eventTime descending
            List<LoginHistory> combined = Stream.concat(teamHistory.getContent().stream(), selfHistoryList.stream())
                .sorted(Comparator.comparing(LoginHistory::getEventTime).reversed())
                .collect(Collectors.toList());
            history = new PageImpl<>(combined, pageable, combined.size());
        }

        return history.map(this::convertToDTO);
    }

    public List<LoginHistoryDTO> getRecentLogins(Authentication authentication, int days) {
        User currentUser = getCurrentUser(authentication);
        LocalDateTime since = LocalDateTime.now().minusDays(days);
        
        List<LoginHistory> history;

        switch (currentUser.getRole()) {
            case ADMIN:
                // Admin can see all recent logins
                history = loginHistoryRepository.findByEventTypeAndEventTimeAfterOrderByEventTimeDesc(
                    LoginHistory.EventType.LOGIN, since);
                break;
            case MANAGER:
                // Manager can see recent logins of their team
                history = loginHistoryRepository.findByUserManagerAndEventTypeAndEventTimeAfterOrderByEventTimeDesc(
                    currentUser, LoginHistory.EventType.LOGIN, since);
                break;
            case EMPLOYEE:
                // Employee can only see their own recent logins
                history = loginHistoryRepository.findByUserAndEventTypeOrderByEventTimeDesc(
                    currentUser, LoginHistory.EventType.LOGIN);
                // Filter to recent ones
                history = history.stream()
                    .filter(login -> login.getEventTime().isAfter(since))
                    .collect(Collectors.toList());
                break;
            default:
                throw new RuntimeException("Unauthorized role");
        }

        return history.stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }

    public void recordLogin(User user) {
        LoginHistory loginEvent = new LoginHistory();
        loginEvent.setUser(user);
        loginEvent.setEventType(LoginHistory.EventType.LOGIN);
        loginEvent.setEventTime(LocalDateTime.now());
        
        loginHistoryRepository.save(loginEvent);
    }



    public Page<LoginHistoryDTO> getMyOwnLoginHistory(Authentication authentication, int page, int size) {
        User currentUser = getCurrentUser(authentication);
        Pageable pageable = PageRequest.of(page, size);
        
        // Always return current user's own login history regardless of role
        Page<LoginHistory> history = loginHistoryRepository.findByUserOrderByEventTimeDesc(currentUser, pageable);
        return history.map(this::convertToDTO);
    }

    public Page<LoginHistoryDTO> getUserLoginHistory(Authentication authentication, Long userId, int page, int size) {
        User currentUser = getCurrentUser(authentication);
        if (currentUser.getRole() != Role.ADMIN && currentUser.getRole() != Role.MANAGER) {
            throw new RuntimeException("Unauthorized: Only Admin and Manager can view other users' login history");
        }
        
        User targetUser = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
            
        // If manager, verify targetUser belongs to their team
        if (currentUser.getRole() == Role.MANAGER && (targetUser.getManager() == null || !targetUser.getManager().getId().equals(currentUser.getId()))) {
            throw new RuntimeException("Unauthorized: Manager can only view their own team's login history");
        }
        
        Pageable pageable = PageRequest.of(page, size);
        Page<LoginHistory> history = loginHistoryRepository.findByUserOrderByEventTimeDesc(targetUser, pageable);
        return history.map(this::convertToDTO);
    }
    private User getCurrentUser(Authentication authentication) {
        String email = authentication.getName();
        return userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found"));
    }

    private LoginHistoryDTO convertToDTO(LoginHistory loginHistory) {
        return new LoginHistoryDTO(
            loginHistory.getId(),
            loginHistory.getUser().getId(),
            loginHistory.getUser().getEmail(),
            loginHistory.getUser().getName(),
            loginHistory.getEventType(),
            loginHistory.getEventTime()
        );
    }
}
