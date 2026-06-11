package com.example.Enterprise.task.and.workflow.management.system.service;

import com.example.Enterprise.task.and.workflow.management.system.auth.LoginRequest;
import com.example.Enterprise.task.and.workflow.management.system.dto.CreateAdminRequest;
import com.example.Enterprise.task.and.workflow.management.system.dto.CreateManagerRequest;
import com.example.Enterprise.task.and.workflow.management.system.dto.UpdateStatusRequest;
import com.example.Enterprise.task.and.workflow.management.system.entity.Role;
import com.example.Enterprise.task.and.workflow.management.system.entity.User;
import com.example.Enterprise.task.and.workflow.management.system.entity.Task;
import com.example.Enterprise.task.and.workflow.management.system.entity.TaskStatus;
import com.example.Enterprise.task.and.workflow.management.system.repository.UserRepository;
import com.example.Enterprise.task.and.workflow.management.system.repository.TaskRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class AdminService {
    private final UserRepository userRepository ;
    private final PasswordEncoder passwordEncoder ;
    private final TaskRepository taskRepository ;
    public AdminService(UserRepository userRepository, PasswordEncoder passwordEncoder, TaskRepository taskRepository) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.taskRepository = taskRepository;
    }
    public ResponseEntity<?> createAdmin(
             CreateAdminRequest request) {

        if (userRepository.existsByEmail(request.getEmail())) {
            return ResponseEntity
                    .badRequest()
                    .body("Email already exists");
        }

        User admin = new User();
        admin.setEmail(request.getEmail());
        admin.setPassword(
                passwordEncoder.encode(request.getPassword())
        );
        admin.setRole(Role.ADMIN);
        admin.setActive(true);
        admin.setDeleted(false);

        userRepository.save(admin);

        return ResponseEntity.ok("Admin created");
    }
    public ResponseEntity<?> createManager(
             CreateManagerRequest request) {

        if (userRepository.existsByEmail(request.getEmail())) {
            return ResponseEntity
                    .badRequest()
                    .body("Email already exists");
        }

        User manager = new User();
        manager.setEmail(request.getEmail());
        manager.setPassword(
                passwordEncoder.encode(request.getPassword())
        );
        manager.setRole(Role.MANAGER);
        manager.setActive(true);
        manager.setDeleted(false);

        userRepository.save(manager);

        return ResponseEntity.ok("Manager created");
    }
    public ResponseEntity<?> createEmployee(LoginRequest request){
        if (userRepository.existsByEmail(request.getEmail())) {
            return ResponseEntity
                    .badRequest()
                    .body("Email already exists");
        }

        User employee = new User();
        employee.setEmail(request.getEmail());
        employee.setPassword(
                passwordEncoder.encode(request.getPassword())
        );
        employee.setRole(Role.EMPLOYEE);
        employee.setActive(true);
        employee.setDeleted(false);

        userRepository.save(employee);

        return ResponseEntity.ok("Employee created");
    }
    public ResponseEntity<?> updateUserStatus(
             Long id,
             UpdateStatusRequest request) {

        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        if(user.getRole() == Role.ADMIN){
            return ResponseEntity
                    .badRequest()
                    .body("Cannot change status of admin user");
        }
        user.setActive(request.isActive());
        userRepository.save(user);

        return ResponseEntity.ok("Status updated");
    }
    public ResponseEntity<?> deleteUser(
             Long id) {

        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setDeleted(true);
        user.setActive(false);
        userRepository.save(user);

        return ResponseEntity.ok("User deleted");
    }
    public ResponseEntity<?> getUsers(Pageable pageable) {
        Page<User> users = userRepository.findByDeletedFalse(pageable);
        for (User u : users.getContent()) {
            if (u.getRole() == Role.EMPLOYEE) {
                List<Task> tasks = taskRepository.findByAssignedTo(u);
                if (tasks.isEmpty()) {
                    u.setDoneBeforeDeadlinePercentage(-1.0);
                } else {
                    long completedBefore = tasks.stream()
                        .filter(t -> t.getStatus() == TaskStatus.COMPLETED 
                            && t.getCompletedAt() != null 
                            && (t.getCompletedAt().isBefore(t.getDeadline()) || t.getCompletedAt().isEqual(t.getDeadline())))
                        .count();
                    double pct = ((double) completedBefore / tasks.size()) * 100.0;
                    u.setDoneBeforeDeadlinePercentage(pct);
                }
            }
        }
        return ResponseEntity.ok(users);
    }
    public void assignManager(Long userId, Long managerId) {

        User employee = userRepository.findByIdAndDeletedFalse(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        User manager = userRepository.findByIdAndDeletedFalse(managerId)
                .orElseThrow(() -> new RuntimeException("Manager not found"));

        if (manager.getRole() != Role.MANAGER) {
            throw new RuntimeException("Assigned user is not a manager");
        }

        if (employee.getRole() == Role.ADMIN) {
            throw new RuntimeException("Admin cannot be assigned");
        }

        employee.setManager(manager);
        userRepository.save(employee);
    }

}

