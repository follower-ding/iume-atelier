package com.iumeatelier.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TopArticleViewResponse {

    private Long articleId;
    private String title;
    private String slug;
    private Long viewCount;
}
