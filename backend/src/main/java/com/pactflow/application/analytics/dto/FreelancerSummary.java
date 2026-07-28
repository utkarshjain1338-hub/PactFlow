package com.pactflow.application.analytics.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FreelancerSummary {
    private String totalEarnedXlm;
    private int milestonesCompleted;
    private int milestonesInProgress;
    private int activeProjects;
    private double avgCompletionDays;
}
