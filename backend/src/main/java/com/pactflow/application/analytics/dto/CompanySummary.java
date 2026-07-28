package com.pactflow.application.analytics.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CompanySummary {
    private String totalPaidXlm;
    private String totalLockedInEscrowXlm;
    private int milestonesCompleted;
    private int activeProjects;
    private int projectsCompleted;
}
