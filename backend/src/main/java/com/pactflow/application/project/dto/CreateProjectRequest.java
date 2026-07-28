package com.pactflow.application.project.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonFormat;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateProjectRequest {
    // Optional during draft
    @JsonAlias("freelancerEmail")
    @jakarta.validation.constraints.Email(message = "Must be a valid email address")
    private String assigneeEmail;

    @NotBlank(message = "Title is required")
    @Size(min = 5, max = 200, message = "Title must be between 5 and 200 characters")
    private String title;

    @Size(max = 5000, message = "Description must not exceed 5000 characters")
    private String description;

    @NotNull(message = "Total budget is required")
    @DecimalMin(value = "0.0000001", message = "Total budget must be positive")
    private BigDecimal totalBudgetXlm;

    @FutureOrPresent(message = "Deadline must be in the present or future")
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
    private LocalDate deadline;
}
