package com.iumeatelier.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Admin dashboard statistics")
public class AdminStatsResponse {

    private long userCount;
    private long articleCount;
    private long publishedCount;
    private long draftCount;
    private long commentCount;
    private long categoryCount;
    private long tagCount;
    private List<TrendPoint> userTrend;
    private List<TrendPoint> articleTrend;
    private List<TrendPoint> commentTrend;
}
