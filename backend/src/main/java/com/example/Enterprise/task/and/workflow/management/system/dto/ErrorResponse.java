package com.example.Enterprise.task.and.workflow.management.system.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ErrorResponse {
    private int status;
    private String error;
    private String message;
    private String code;

    public ErrorResponse(int status, String error, String message) {
        this.status = status;
        this.error = error;
        this.message = message;
        this.code = getDefaultErrorCode(error);
    }

    private String getDefaultErrorCode(String error) {
        if (error == null) return "INTERNAL_ERROR";
        return error.toUpperCase().replace(" ", "_");
    }
}
