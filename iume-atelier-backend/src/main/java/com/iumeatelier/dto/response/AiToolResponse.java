package com.iumeatelier.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class AiToolResponse {
    private Long id;
    private String slug;
    private String name;
    private String description;
    private String category;
    private String icon;
    private List<String> tags;
    private String url;
    private Boolean featured;
    private String source;
    private AiToolDetailResponse detail;
    private Integer sortOrder;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
