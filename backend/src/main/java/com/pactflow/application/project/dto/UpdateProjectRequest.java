package com.pactflow.application.project.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import com.fasterxml.jackson.annotation.JsonFormat;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateProjectRequest {
    private String title;
    private String description;
    private BigDecimal totalBudgetXlm;
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
    private LocalDate deadline;
    @jakarta.validation.constraints.Email(message = "Must be a valid email address")
    private String freelancerEmail;
    private String status;
}
