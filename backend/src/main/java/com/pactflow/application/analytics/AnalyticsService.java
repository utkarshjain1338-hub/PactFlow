package com.pactflow.application.analytics;

import com.pactflow.application.analytics.dto.*;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AnalyticsService {

    public Object getMyAnalytics(String dateFrom, String dateTo) {
        String userId = "mock-user-id";
        String accountType = "COMPANY"; // Mocked to fix compilation

        AnalyticsPeriod period = new AnalyticsPeriod(
            dateFrom != null ? dateFrom : "2026-06-12",
            dateTo != null ? dateTo : "2026-07-12"
        );

        if ("COMPANY".equals(accountType)) {
            return CompanyAnalyticsResponse.builder()
                .userId(userId)
                .accountType("COMPANY")
                .period(period)
                .summary(CompanySummary.builder()
                    .totalPaidXlm("500.0000000")
                    .totalLockedInEscrowXlm("200.0000000")
                    .milestonesCompleted(4)
                    .activeProjects(2)
                    .projectsCompleted(1)
                    .build())
                .spendingTrend(List.of(
                    new TrendData("2026-07-01", "100.0000000")
                ))
                .build();
        } else {
            return FreelancerAnalyticsResponse.builder()
                .userId(userId)
                .accountType("FREELANCER")
                .period(period)
                .summary(FreelancerSummary.builder()
                    .totalEarnedXlm("850.0000000")
                    .milestonesCompleted(5)
                    .milestonesInProgress(2)
                    .activeProjects(3)
                    .avgCompletionDays(8.4)
                    .build())
                .earningsTrend(List.of(
                    new TrendData("2026-07-01", "100.0000000"),
                    new TrendData("2026-07-08", "200.0000000")
                ))
                .build();
        }
    }

    public Object getPlatformAnalytics() {
        return "Platform metrics under construction";
    }
}
