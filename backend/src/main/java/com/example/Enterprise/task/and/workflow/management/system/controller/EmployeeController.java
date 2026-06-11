package com.example.Enterprise.task.and.workflow.management.system.controller;

import com.example.Enterprise.task.and.workflow.management.system.service.EmployeeService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/employees")
@PreAuthorize("hasAnyRole('EMPLOYEE', 'MANAGER')")
public class EmployeeController {
    EmployeeService employeeService;

    public EmployeeController(EmployeeService employeeService) {
        this.employeeService = employeeService;
    }
    @GetMapping("/announcements")
    public Object getAnnouncements(Authentication authentication) {
        return employeeService.announcements(authentication);
    }
}
