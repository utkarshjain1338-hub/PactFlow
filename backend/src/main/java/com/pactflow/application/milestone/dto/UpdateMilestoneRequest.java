package com.pactflow.application.milestone.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import lombok.Data;

@Data
public class UpdateMilestoneRequest {
    private String title;
    private String description;
    private BigDecimal amountXlm;
    private Integer sequenceOrder;
    private LocalDate dueDate;
    private Boolean strictDeadline;
}
