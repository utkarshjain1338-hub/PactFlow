package com.pactflow.application.milestone.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.LocalDate;
import lombok.Data;

@Data
public class CreateMilestoneRequest {

    @NotBlank(message = "Title is required")
    @Size(min = 3, max = 200, message = "Title must be between 3 and 200 characters")
    private String title;

    @Size(max = 3000, message = "Description must not exceed 3000 characters")
    private String description;

    @NotNull(message = "Amount is required")
    @DecimalMin(value = "0.0000001", message = "Amount must be positive")
    private BigDecimal amountXlm;

    @NotNull(message = "Sequence order is required")
    private Integer sequenceOrder;

    @FutureOrPresent(message = "Due date must be in the present or future")
    private LocalDate dueDate;

    private boolean strictDeadline;
}
