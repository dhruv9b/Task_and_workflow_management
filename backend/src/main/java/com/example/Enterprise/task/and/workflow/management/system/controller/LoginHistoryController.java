package com.example.Enterprise.task.and.workflow.management.system.controller;

import com.example.Enterprise.task.and.workflow.management.system.dto.LoginHistoryDTO;
import com.example.Enterprise.task.and.workflow.management.system.service.LoginHistoryService;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/login-history")
public class LoginHistoryController {

    private final LoginHistoryService loginHistoryService;

    public LoginHistoryController(LoginHistoryService loginHistoryService) {
        this.loginHistoryService = loginHistoryService;
    }

    @GetMapping("/logins")
    public ResponseEntity<Page<LoginHistoryDTO>> getLoginHistory(
            Authentication authentication,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        Page<LoginHistoryDTO> history = loginHistoryService.getLoginHistory(authentication, page, size);
        return ResponseEntity.ok(history);
    }

    @GetMapping("/all")
    public ResponseEntity<Page<LoginHistoryDTO>> getAllHistory(
            Authentication authentication,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        Page<LoginHistoryDTO> history = loginHistoryService.getAllHistory(authentication, page, size);
        return ResponseEntity.ok(history);
    }

    @GetMapping("/recent")
    public ResponseEntity<List<LoginHistoryDTO>> getRecentLogins(
            Authentication authentication,
            @RequestParam(defaultValue = "7") int days) {
        
        List<LoginHistoryDTO> recentLogins = loginHistoryService.getRecentLogins(authentication, days);
        return ResponseEntity.ok(recentLogins);
    }

    @GetMapping("/my-logins")
    public ResponseEntity<Page<LoginHistoryDTO>> getMyLoginHistory(
            Authentication authentication,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        Page<LoginHistoryDTO> history = loginHistoryService.getMyOwnLoginHistory(authentication, page, size);
        return ResponseEntity.ok(history);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<Page<LoginHistoryDTO>> getUserLoginHistory(
            Authentication authentication,
            @PathVariable Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        Page<LoginHistoryDTO> history = loginHistoryService.getUserLoginHistory(authentication, userId, page, size);
        return ResponseEntity.ok(history);
    }
}
