package com.iumeatelier.dto.response;

import com.iumeatelier.enums.ArticleStatus;
import io.swagger.v3.oas.annotations.media.Schema;
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
@Schema(description = "Article response")
public class ArticleResponse {

    @Schema(description = "Article ID", example = "1")
    private Long id;

    @Schema(description = "Title", example = "Getting Started with Spring Boot 3")
    private String title;

    @Schema(description = "URL slug", example = "getting-started-with-spring-boot-3")
    private String slug;

    @Schema(description = "Full content")
    private String content;

    @Schema(description = "Summary")
    private String summary;

    @Schema(description = "Cover image URL")
    private String coverImage;

    @Schema(description = "Status", example = "PUBLISHED")
    private ArticleStatus status;

    @Schema(description = "Author ID", example = "1")
    private Long authorId;

    @Schema(description = "Author nickname", example = "Admin")
    private String authorName;

    @Schema(description = "Category ID", example = "1")
    private Long categoryId;

    @Schema(description = "Category name", example = "Technology")
    private String categoryName;

    @Schema(description = "View count", example = "128")
    private Integer viewCount;

    @Schema(description = "Tags")
    private List<TagResponse> tags;

    @Schema(description = "Created at")
    private LocalDateTime createdAt;

    @Schema(description = "Updated at")
    private LocalDateTime updatedAt;

    @Schema(description = "Published at")
    private LocalDateTime publishedAt;
}
