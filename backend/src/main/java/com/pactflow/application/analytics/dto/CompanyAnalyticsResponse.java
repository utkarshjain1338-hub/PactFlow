package com.pactflow.application.analytics.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CompanyAnalyticsResponse {
    private String userId;
    private String accountType;
    private AnalyticsPeriod period;
    private CompanySummary summary;
    private List<TrendData> spendingTrend;
}
