package com.example.Enterprise.task.and.workflow.management.system.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;
import com.example.Enterprise.task.and.workflow.management.system.entity.Role;
import com.example.Enterprise.task.and.workflow.management.system.entity.User;
import com.example.Enterprise.task.and.workflow.management.system.repository.UserRepository;
@Configuration
public class AdminInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AdminInitializer(UserRepository userRepository,
                            PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {

        String adminEmail = System.getProperty("ADMIN_EMAIL", "admin@company.com");
        String adminPassword = System.getProperty("ADMIN_PASSWORD");

        if (adminPassword == null || adminPassword.isEmpty()) {
            throw new IllegalStateException("ADMIN_PASSWORD environment variable must be set. Please add it to your .env file.");
        }

        if (userRepository.existsByEmail(adminEmail)) {
            return; // admin already exists
        }

        User admin = new User();
        admin.setEmail(adminEmail);
        admin.setPassword(passwordEncoder.encode(adminPassword));
        admin.setRole(Role.ADMIN);
        admin.setEnabled(true);

        userRepository.save(admin);

        System.out.println("✅ Default admin created: " + adminEmail);
    }
}

