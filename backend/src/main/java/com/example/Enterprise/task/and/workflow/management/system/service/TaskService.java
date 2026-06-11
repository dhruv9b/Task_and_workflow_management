package com.example.Enterprise.task.and.workflow.management.system.service;

import com.example.Enterprise.task.and.workflow.management.system.dto.TaskDto;
import com.example.Enterprise.task.and.workflow.management.system.dto.TaskStatsDto;
import com.example.Enterprise.task.and.workflow.management.system.entity.Role;
import com.example.Enterprise.task.and.workflow.management.system.entity.Task;
import com.example.Enterprise.task.and.workflow.management.system.entity.TaskStatus;
import com.example.Enterprise.task.and.workflow.management.system.entity.User;
import com.example.Enterprise.task.and.workflow.management.system.repository.TaskRepository;
import com.example.Enterprise.task.and.workflow.management.system.repository.UserRepository;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class TaskService {
    private final TaskRepository taskRepository;
    private final UserRepository userRepository;
    private final Path fileStorageLocation;

    public TaskService(TaskRepository taskRepository, UserRepository userRepository) {
        this.taskRepository = taskRepository;
        this.userRepository = userRepository;
        
        // Define directory to store task files inside workspace
        this.fileStorageLocation = Paths.get("uploads/tasks").toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.fileStorageLocation);
            System.out.println("Task uploads directory initialized at: " + this.fileStorageLocation);
        } catch (IOException e) {
            throw new RuntimeException("Could not create directory to upload files.", e);
        }
    }

    public TaskDto assignTask(String managerEmail, Long employeeId, String title, String description, MultipartFile file, String deadlineStr) {
        User manager = userRepository.findByEmail(managerEmail)
                .orElseThrow(() -> new RuntimeException("Manager not found"));

        User employee = userRepository.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Employee not found"));

        if (employee.getRole() != Role.EMPLOYEE) {
            throw new RuntimeException("Tasks can only be assigned to Employees");
        }

        // Parse deadline
        LocalDateTime deadline;
        try {
            deadline = LocalDateTime.parse(deadlineStr, DateTimeFormatter.ISO_LOCAL_DATE_TIME);
        } catch (Exception e) {
            // Fallback parsing support
            try {
                deadline = LocalDateTime.parse(deadlineStr, DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
            } catch (Exception ex) {
                throw new RuntimeException("Invalid deadline format. Use ISO format (yyyy-MM-ddTHH:mm:ss)", ex);
            }
        }

        String fileName = null;
        String filePath = null;

        if (file != null && !file.isEmpty()) {
            fileName = file.getOriginalFilename();
            // Prefix filename with UUID to avoid collisions
            String targetFileName = UUID.randomUUID().toString() + "_" + fileName;
            try {
                Path targetLocation = this.fileStorageLocation.resolve(targetFileName);
                Files.copy(file.getInputStream(), targetLocation);
                filePath = targetLocation.toString();
            } catch (IOException e) {
                throw new RuntimeException("Could not store file " + fileName + ". Please try again!", e);
            }
        }

        Task task = new Task();
        task.setTitle(title);
        task.setDescription(description);
        task.setFileName(fileName);
        task.setFilePath(filePath);
        task.setDeadline(deadline);
        task.setAssignedTo(employee);
        task.setAssignedBy(manager);

        Task saved = taskRepository.save(task);
        return TaskDto.from(saved);
    }

    public List<TaskDto> getEmployeeTasks(String employeeEmail) {
        User employee = userRepository.findByEmail(employeeEmail)
                .orElseThrow(() -> new RuntimeException("Employee not found"));

        return taskRepository.findByAssignedToOrderByCreatedAtDesc(employee).stream()
                .map(TaskDto::from)
                .collect(Collectors.toList());
    }

    public List<TaskDto> getManagerTeamTasks(String managerEmail) {
        User manager = userRepository.findByEmail(managerEmail)
                .orElseThrow(() -> new RuntimeException("Manager not found"));

        return taskRepository.findByAssignedByOrderByCreatedAtDesc(manager).stream()
                .map(TaskDto::from)
                .collect(Collectors.toList());
    }

    public TaskDto markTaskAsDone(String employeeEmail, Long taskId) {
        User employee = userRepository.findByEmail(employeeEmail)
                .orElseThrow(() -> new RuntimeException("Employee not found"));

        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));

        if (!task.getAssignedTo().getId().equals(employee.getId())) {
            throw new RuntimeException("You are not authorized to mark this task as done");
        }

        if (task.getStatus() == TaskStatus.COMPLETED) {
            throw new RuntimeException("Task is already completed");
        }

        task.setStatus(TaskStatus.COMPLETED);
        task.setCompletedAt(LocalDateTime.now());

        Task updated = taskRepository.save(task);
        return TaskDto.from(updated);
    }

    public Resource downloadTaskFile(Long taskId, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));

        // Verify that only the assignee, assigning manager, or an Admin can download
        boolean isAssignee = task.getAssignedTo().getId().equals(user.getId());
        boolean isManager = task.getAssignedBy().getId().equals(user.getId());
        boolean isAdmin = user.getRole() == Role.ADMIN;

        if (!isAssignee && !isManager && !isAdmin) {
            throw new RuntimeException("You are not authorized to download this task attachment");
        }

        if (task.getFilePath() == null) {
            throw new RuntimeException("No attachment found for this task");
        }

        File file = new File(task.getFilePath());
        if (!file.exists()) {
            throw new RuntimeException("Attachment file not found on server");
        }

        return new FileSystemResource(file);
    }

    public TaskStatsDto getTaskStats(String managerEmail) {
        User manager = userRepository.findByEmail(managerEmail)
                .orElseThrow(() -> new RuntimeException("Manager not found"));

        List<Task> tasks = taskRepository.findByAssignedByOrderByCreatedAtDesc(manager);

        int total = tasks.size();
        int completed = 0;
        int pending = 0;
        int beforeDeadline = 0;
        int afterDeadline = 0;
        int notCompleted = 0;

        for (Task task : tasks) {
            if (task.getStatus() == TaskStatus.COMPLETED) {
                completed++;
                LocalDateTime doneTime = task.getCompletedAt();
                if (doneTime != null && (doneTime.isBefore(task.getDeadline()) || doneTime.isEqual(task.getDeadline()))) {
                    beforeDeadline++;
                } else {
                    afterDeadline++;
                }
            } else {
                pending++;
                notCompleted++;
            }
        }

        TaskStatsDto stats = new TaskStatsDto();
        stats.setTotalTasks(total);
        stats.setCompletedTasks(completed);
        stats.setPendingTasks(pending);
        
        stats.setDoneBeforeDeadlineCount(beforeDeadline);
        stats.setDoneBeforeDeadlinePercentage(total > 0 ? ((double) beforeDeadline / total) * 100.0 : 0.0);
        
        stats.setDoneAfterDeadlineCount(afterDeadline);
        stats.setDoneAfterDeadlinePercentage(total > 0 ? ((double) afterDeadline / total) * 100.0 : 0.0);
        
        stats.setNotCompletedCount(notCompleted);
        stats.setNotCompletedPercentage(total > 0 ? ((double) notCompleted / total) * 100.0 : 0.0);

        stats.setTaskHistory(tasks.stream().map(TaskDto::from).collect(Collectors.toList()));

        return stats;
    }
}
