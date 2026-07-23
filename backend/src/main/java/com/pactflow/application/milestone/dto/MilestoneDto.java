package com.pactflow.application.milestone.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class MilestoneDto {
    private UUID id;
    private UUID projectId;
    private String title;
    private String description;
    private BigDecimal amountXlm;
    private String assetCode;
    private String status;
    private Integer sequenceOrder;
    private LocalDate dueDate;
    private boolean isStrictDeadline;
    private boolean isDeleted;
}
