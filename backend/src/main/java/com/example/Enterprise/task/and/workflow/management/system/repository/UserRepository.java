package com.example.Enterprise.task.and.workflow.management.system.repository;

import com.example.Enterprise.task.and.workflow.management.system.entity.Role;
import com.example.Enterprise.task.and.workflow.management.system.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByRole(Role role);
    Page<User> findByDeletedFalse(Pageable pageable);
    boolean existsByEmail(String email);
    List<User> findByManager_IdAndDeletedFalse(Long managerId);

    // For admin assigning
    Optional<User> findByIdAndDeletedFalse(Long id);
}
