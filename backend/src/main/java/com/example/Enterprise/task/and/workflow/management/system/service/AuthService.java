package com.example.Enterprise.task.and.workflow.management.system.service;

import com.example.Enterprise.task.and.workflow.management.system.auth.LoginRequest;
import com.example.Enterprise.task.and.workflow.management.system.auth.LoginResponse;
import com.example.Enterprise.task.and.workflow.management.system.dto.ChangePasswordRequest;
import com.example.Enterprise.task.and.workflow.management.system.dto.UserResponseDTO;
import com.example.Enterprise.task.and.workflow.management.system.entity.User;
import com.example.Enterprise.task.and.workflow.management.system.repository.UserRepository;

import com.example.Enterprise.task.and.workflow.management.system.security.JwtUtil;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.RequestBody;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final LoginHistoryService loginHistoryService;

    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtUtil jwtUtil,
            LoginHistoryService loginHistoryService
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.loginHistoryService = loginHistoryService;
    }

    public LoginResponse login(LoginRequest request) {

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() ->
                        new RuntimeException("Invalid credentials"));

        if (!passwordEncoder.matches(
                request.getPassword(),
                user.getPassword()
        )) {
            throw new RuntimeException("Invalid credentials");
        }

        String token = jwtUtil.generateToken(
                user.getEmail(),
                user.getRole().name()
        );

        // Record login history
        loginHistoryService.recordLogin(user);

        return new LoginResponse(
                token,
                user.getRole().name(),
                user.isForcePasswordChange(),
                user.isActive()
        );
    }

    public ResponseEntity<?> changePassword(
            @RequestBody ChangePasswordRequest request,
            Authentication authentication
    ) {

        String email = authentication.getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        if (!passwordEncoder.matches(
                request.getOldPassword(),
                user.getPassword()
        )) {

            return ResponseEntity
                    .badRequest()
                    .body("Old password is incorrect");
        }

        user.setPassword(
                passwordEncoder.encode(request.getNewPassword())
        );

        if (user.isForcePasswordChange()) {
            user.setForcePasswordChange(false);
        }

        userRepository.save(user);

        return ResponseEntity.ok(
                "Password changed successfully"
        );
    }

    public ResponseEntity<UserResponseDTO> getCurrentUser(
            Authentication authentication
    ) {

        try {

            // Get current user from security context
            String email = authentication.getName();

            // Find user in database
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() ->
                            new RuntimeException("User not found"));

            // Create response DTO (don't send password)
            UserResponseDTO response = new UserResponseDTO(
                    user.getId(),
                    user.getEmail(),
                    user.getRole(),
                    user.getName(),
                    user.isActive(),
                    user.getLastLogin()
            );

            return ResponseEntity.ok(response);

        } catch (Exception e) {

            throw new RuntimeException(
                    "Unauthorized",
                    e
            );
        }
    }
}
