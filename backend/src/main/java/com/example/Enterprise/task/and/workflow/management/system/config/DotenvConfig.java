package com.example.Enterprise.task.and.workflow.management.system.config;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.context.annotation.Configuration;

import jakarta.annotation.PostConstruct;

@Configuration
public class DotenvConfig {

    @PostConstruct
    public void loadEnvVariables() {
        try {
            Dotenv dotenv = Dotenv.configure()
                    .directory("./")
                    .load();
            
            // Set system properties for each environment variable
            dotenv.entries().forEach(entry -> {
                System.setProperty(entry.getKey(), entry.getValue());
            });
        } catch (Exception e) {
            System.err.println("Error loading .env file: " + e.getMessage());
            System.err.println("Make sure .env file exists in the backend directory with all required variables.");
            throw new RuntimeException("Failed to load .env file. Please create it from .env.example", e);
        }
    }
}
