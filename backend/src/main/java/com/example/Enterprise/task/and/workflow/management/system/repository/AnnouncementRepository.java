package com.example.Enterprise.task.and.workflow.management.system.repository;

import com.example.Enterprise.task.and.workflow.management.system.entity.Announcement;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AnnouncementRepository extends JpaRepository<Announcement, Long> {
    List<Announcement> findByManager_IdOrderByCreatedAtDesc(Long managerId);
}
