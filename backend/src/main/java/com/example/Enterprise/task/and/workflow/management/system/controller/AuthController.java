package com.example.Enterprise.task.and.workflow.management.system.controller;

import com.example.Enterprise.task.and.workflow.management.system.auth.LoginRequest;
import com.example.Enterprise.task.and.workflow.management.system.auth.LoginResponse;
import com.example.Enterprise.task.and.workflow.management.system.dto.ChangePasswordRequest;
import com.example.Enterprise.task.and.workflow.management.system.dto.UserResponseDTO;
import com.example.Enterprise.task.and.workflow.management.system.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(
            @RequestBody LoginRequest request
    ) {

        return ResponseEntity.ok(
                authService.login(request)
        );
    }

    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(
            @RequestBody ChangePasswordRequest request,
            Authentication authentication
    ) {

        return authService.changePassword(
                request,
                authentication
        );
    }

    @GetMapping("/me")
    public ResponseEntity<UserResponseDTO> getCurrentUser(
            Authentication authentication
    ) {

        return authService.getCurrentUser(
                authentication
        );
    }
}


