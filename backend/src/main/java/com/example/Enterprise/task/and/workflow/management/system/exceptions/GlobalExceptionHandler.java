package com.example.Enterprise.task.and.workflow.management.system.exceptions;

import com.example.Enterprise.task.and.workflow.management.system.dto.ErrorResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<ErrorResponse> handleRuntimeException(
            RuntimeException ex
    ) {
        String message = ex.getMessage();
        String error = "Bad Request";
        String code = determineErrorCode(message);

        ErrorResponse errorResponse = new ErrorResponse(
                HttpStatus.BAD_REQUEST.value(),
                error,
                message,
                code
        );

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(errorResponse);
    }

    private String determineErrorCode(String message) {
        if (message == null) return "INTERNAL_ERROR";

        if (message.contains("Invalid credentials")) return "INVALID_CREDENTIALS";
        if (message.contains("Unauthorized")) return "UNAUTHORIZED";
        if (message.contains("not found")) return "NOT_FOUND";
        if (message.contains("Old password is incorrect")) return "INVALID_OLD_PASSWORD";
        if (message.contains("Admin cannot be assigned")) return "INVALID_ASSIGNMENT";
        if (message.contains("Assigned user is not a manager")) return "INVALID_ROLE";

        return "BAD_REQUEST";
    }
}