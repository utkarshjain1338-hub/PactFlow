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
public class FreelancerAnalyticsResponse {
    private String userId;
    private String accountType;
    private AnalyticsPeriod period;
    private FreelancerSummary summary;
    private List<TrendData> earningsTrend;
}
