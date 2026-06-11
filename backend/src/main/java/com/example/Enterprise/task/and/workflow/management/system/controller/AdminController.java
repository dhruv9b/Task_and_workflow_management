package com.example.Enterprise.task.and.workflow.management.system.controller;

import com.example.Enterprise.task.and.workflow.management.system.auth.LoginRequest;
import com.example.Enterprise.task.and.workflow.management.system.dto.CreateAdminRequest;
import com.example.Enterprise.task.and.workflow.management.system.dto.CreateManagerRequest;
import com.example.Enterprise.task.and.workflow.management.system.dto.UpdateStatusRequest;
import com.example.Enterprise.task.and.workflow.management.system.service.AdminService;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {
    private final AdminService adminService;
    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }
    @PostMapping("/create-admin")
    public ResponseEntity<?> createAdmin(@RequestBody CreateAdminRequest request) {
        return adminService.createAdmin(request);
    }
    @PostMapping("/create-manager")
    public ResponseEntity<?> createManager(@RequestBody CreateManagerRequest request) {
        return adminService.createManager(request);
    }
    @PostMapping("/create-employee")
    public ResponseEntity<?> createEmployee(@RequestBody LoginRequest request) {
        return adminService.createEmployee(request);
    }
    @PutMapping("/update-user-status/{id}")
    public ResponseEntity<?> updateUserStatus(
            @PathVariable Long id,
            @RequestBody UpdateStatusRequest request){
        return adminService.updateUserStatus(id, request);
    }
    @DeleteMapping("/delete-user/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id){
        return adminService.deleteUser(id);
    }
    @GetMapping("/users")
    public ResponseEntity<?> getUsers(Pageable pageable) {
        return adminService.getUsers(pageable);
    }
    @PatchMapping("/users/{userId}/assign-manager/{managerId}")
    public ResponseEntity<?> assignManager(
            @PathVariable Long userId,
            @PathVariable Long managerId) {

        adminService.assignManager(userId, managerId);
        return ResponseEntity.ok().build();
    }



}
