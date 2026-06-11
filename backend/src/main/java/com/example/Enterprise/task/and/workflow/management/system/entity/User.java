package com.example.Enterprise.task.and.workflow.management.system.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name="users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false)
    private String name;
    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private boolean deleted = false;
    @Enumerated(EnumType.STRING)
    private Role role;

    private boolean enabled;
    private boolean active = true;
    @Column(name = "last_login")
    private LocalDateTime lastLogin;
    private boolean forcePasswordChange = true;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "manager_id")
    @JsonBackReference
    private User manager;

    // 👇 Optional: manager → employees
    @OneToMany(mappedBy = "manager")
    @JsonManagedReference
    private List<User> team = new ArrayList<>();

    @Transient
    private Double doneBeforeDeadlinePercentage;

    public User(){
    }
    public User(String email, String password, Role role, boolean enabled, boolean active) {
        this.email = email;
        this.role = role;
        this.enabled = enabled;
        this.active = active;
        this.name=name;
    }



    // Getters and Setters
    public String getName() {
        return name;
    }
    public void setName(String name) {
        this.name = name;
    }
    public Long getId() {
        return id;
    }
    public void setId(Long id) {
        this.id = id;
    }
    public String getEmail() {
        return email;
    }
    public void setEmail(String email) {
        this.email = email;
    }
    public String getPassword() {
        return password;
    }
    public void setPassword(String password) {
        this.password = password;
    }
    public Role getRole() {
        return role;
    }
    public void setRole(Role role) {
        this.role = role;
    }
    public boolean isActive() {
        return active;
    }
    public void setActive(boolean active) {
        this.active = active;
    }
    public boolean isForcePasswordChange() {
        return forcePasswordChange;
    }
    public void setForcePasswordChange(boolean forcePasswordChange) {
        this.forcePasswordChange = forcePasswordChange;
    }
    public boolean isEnabled() {
        return enabled;
    }
    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
    }
    public void setDeleted(boolean deleted) {
        this.deleted = deleted;
    }
    public boolean isDeleted() {
        return deleted;
    }
    public User getManager() {
        return manager;
    }
    public void setManager(User manager) {
        this.manager = manager;
    }
    public List<User> getTeam() {
        return team;
    }
    public void setTeam(List<User> team) {
        this.team = team;
    }
    public Long getManagerId() {
        return manager != null ? manager.getId() : null;
    }
    public LocalDateTime getLastLogin() {
        return lastLogin;
    }
    public void setLastLogin(LocalDateTime lastLogin) {
        this.lastLogin = lastLogin;
    }
    public Double getDoneBeforeDeadlinePercentage() {
        return doneBeforeDeadlinePercentage;
    }
    public void setDoneBeforeDeadlinePercentage(Double doneBeforeDeadlinePercentage) {
        this.doneBeforeDeadlinePercentage = doneBeforeDeadlinePercentage;
    }
}
