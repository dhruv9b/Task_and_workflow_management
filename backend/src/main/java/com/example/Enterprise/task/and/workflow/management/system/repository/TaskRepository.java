package com.example.Enterprise.task.and.workflow.management.system.repository;

import com.example.Enterprise.task.and.workflow.management.system.entity.Task;
import com.example.Enterprise.task.and.workflow.management.system.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {
    List<Task> findByAssignedToOrderByCreatedAtDesc(User user);
    List<Task> findByAssignedByOrderByCreatedAtDesc(User manager);
    List<Task> findByAssignedTo(User user);
}
