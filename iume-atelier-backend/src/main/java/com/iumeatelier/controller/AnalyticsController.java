package com.iumeatelier.controller;

import com.iumeatelier.common.Result;
import com.iumeatelier.dto.request.PageViewRequest;
import com.iumeatelier.dto.response.AnalyticsResponse;
import com.iumeatelier.service.AnalyticsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/analytics")
@RequiredArgsConstructor
@Tag(name = "Analytics", description = "Page view analytics")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    @PostMapping("/page-view")
    @Operation(summary = "Record a page view")
    public Result<Void> recordPageView(
            @Valid @RequestBody PageViewRequest request,
            HttpServletRequest httpRequest) {
        String referrer = request.getReferrer();
        if (referrer == null || referrer.isBlank()) {
            referrer = httpRequest.getHeader("Referer");
        }
        analyticsService.record(
                request.getPath(),
                request.getArticleId(),
                referrer,
                httpRequest.getHeader("User-Agent")
        );
        return Result.success();
    }

    @GetMapping("/overview")
    @Operation(summary = "Analytics overview (admin)")
    public Result<AnalyticsResponse> overview() {
        return Result.success(analyticsService.getAnalytics());
    }
}
