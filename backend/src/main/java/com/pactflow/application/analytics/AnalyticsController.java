package com.pactflow.application.analytics;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/analytics")
@RequiredArgsConstructor
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    @GetMapping("/me")
    public ResponseEntity<Object> getMyAnalytics(
            @RequestParam(required = false) String dateFrom,
            @RequestParam(required = false) String dateTo) {
        
        return ResponseEntity.ok(analyticsService.getMyAnalytics(dateFrom, dateTo));
    }

    @GetMapping("/platform")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Object> getPlatformAnalytics() {
        return ResponseEntity.ok(analyticsService.getPlatformAnalytics());
    }
}
