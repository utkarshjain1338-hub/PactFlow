package com.pactflow.application.project.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;
import lombok.Data;

@Data
public class UpdateProjectRequest {
    private String title;
    private String description;
    private BigDecimal totalBudgetXlm;
    private LocalDate deadline;
    private UUID freelancerUserId;
    private String status;
}
