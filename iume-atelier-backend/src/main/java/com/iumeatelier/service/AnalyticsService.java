package com.iumeatelier.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.iumeatelier.dto.response.AnalyticsResponse;
import com.iumeatelier.dto.response.TrendPoint;
import com.iumeatelier.entity.PageView;
import com.iumeatelier.mapper.PageViewMapper;
import com.iumeatelier.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private static final int TREND_DAYS = 7;

    private final PageViewMapper pageViewMapper;
    private final NewsletterService newsletterService;

    public AnalyticsResponse getAnalytics() {
        SecurityUtils.requireAdmin();
        LocalDateTime since = LocalDate.now().minusDays(TREND_DAYS - 1L).atStartOfDay();
        List<PageView> recent = pageViewMapper.selectList(
                new LambdaQueryWrapper<PageView>().ge(PageView::getCreatedAt, since)
        );
        return AnalyticsResponse.builder()
                .pageViewCount(pageViewMapper.selectCount(null))
                .newsletterCount(newsletterService.count())
                .pageViewTrend(buildTrend(recent, TREND_DAYS))
                .topArticles(pageViewMapper.topArticlesSince(since, 10))
                .build();
    }

    public void record(String path, Long articleId, String referrer, String userAgent) {
        PageView view = new PageView();
        view.setPath(path);
        view.setArticleId(articleId);
        view.setReferrer(referrer);
        view.setUserAgent(userAgent != null && userAgent.length() > 500 ? userAgent.substring(0, 500) : userAgent);
        pageViewMapper.insert(view);
    }

    private List<TrendPoint> buildTrend(List<PageView> views, int days) {
        Map<LocalDate, Long> grouped = views.stream()
                .collect(Collectors.groupingBy(v -> v.getCreatedAt().toLocalDate(), Collectors.counting()));
        List<TrendPoint> trend = new ArrayList<>();
        LocalDate start = LocalDate.now().minusDays(days - 1L);
        for (int i = 0; i < days; i++) {
            LocalDate day = start.plusDays(i);
            trend.add(new TrendPoint(day.toString(), grouped.getOrDefault(day, 0L)));
        }
        return trend;
    }
}
