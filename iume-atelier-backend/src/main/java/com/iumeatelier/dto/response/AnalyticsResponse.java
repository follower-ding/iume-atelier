package com.iumeatelier.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AnalyticsResponse {

    private Long pageViewCount;
    private Long newsletterCount;
    private List<TrendPoint> pageViewTrend;
    private List<TopArticleViewResponse> topArticles;
}
