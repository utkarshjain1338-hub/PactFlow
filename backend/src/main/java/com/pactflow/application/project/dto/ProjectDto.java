package com.pactflow.application.project.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ProjectDto {
    private UUID id;
    private UUID clientUserId;
    private UUID clientWalletId;
    private UUID freelancerUserId;
    private UUID freelancerWalletId;
    private String title;
    private String description;
    private String status;
    private BigDecimal totalBudgetXlm;
    private String assetCode;
    private LocalDate deadline;
    private boolean isDeleted;
    private boolean isEscrowReady;
}
