package com.iumeatelier.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SeriesResponse {

    private Long id;
    private String title;
    private String slug;
    private String description;
    private String coverImage;
    private Integer articleCount;
    private List<ArticleResponse> articles;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
