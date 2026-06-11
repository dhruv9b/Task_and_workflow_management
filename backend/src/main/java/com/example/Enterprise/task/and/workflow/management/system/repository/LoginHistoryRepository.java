package com.example.Enterprise.task.and.workflow.management.system.repository;

import com.example.Enterprise.task.and.workflow.management.system.entity.LoginHistory;
import com.example.Enterprise.task.and.workflow.management.system.entity.LoginHistory.EventType;
import com.example.Enterprise.task.and.workflow.management.system.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface LoginHistoryRepository extends JpaRepository<LoginHistory, Long> {

    // Get all history of a user (latest first)
    Page<LoginHistory> findByUserOrderByEventTimeDesc(User user, Pageable pageable);

    // Get only login events
    List<LoginHistory> findByUserAndEventTypeOrderByEventTimeDesc(User user, EventType eventType);

    // Optional: latest event
    LoginHistory findTopByUserOrderByEventTimeDesc(User user);

    // Get all login events for all users (for admin)
    Page<LoginHistory> findByEventTypeOrderByEventTimeDesc(EventType eventType, Pageable pageable);

    // Get all events for all users (for admin)
    Page<LoginHistory> findAllByOrderByEventTimeDesc(Pageable pageable);

    // Get login events for users under a specific manager
    Page<LoginHistory> findByUserManagerAndEventTypeOrderByEventTimeDesc(User manager, EventType eventType, Pageable pageable);

    // Get all events for users under a specific manager
    Page<LoginHistory> findByUserManagerOrderByEventTimeDesc(User manager, Pageable pageable);

    // Get recent login events (last N days)
    List<LoginHistory> findByEventTypeAndEventTimeAfterOrderByEventTimeDesc(EventType eventType, LocalDateTime since);

    // Get recent login events for users under a manager
    List<LoginHistory> findByUserManagerAndEventTypeAndEventTimeAfterOrderByEventTimeDesc(User manager, EventType eventType, LocalDateTime since);
}
