package com.iumeatelier.dto.request;

import com.iumeatelier.enums.ArticleStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.List;

@Data
@Schema(description = "Article create/update request")
public class ArticleRequest {

    @NotBlank(message = "Title is required")
    @Size(max = 200, message = "Title must not exceed 200 characters")
    @Schema(description = "Article title", example = "My First Post")
    private String title;

    @Size(max = 200, message = "Slug must not exceed 200 characters")
    @Schema(description = "URL slug (optional, auto-generated from title if empty)", example = "my-first-post")
    private String slug;

    @NotBlank(message = "Content is required")
    @Schema(description = "Article content in Markdown", example = "# Hello World")
    private String content;

    @Size(max = 500, message = "Summary must not exceed 500 characters")
    @Schema(description = "Short summary", example = "A brief introduction")
    private String summary;

    @Schema(description = "Cover image URL", example = "https://example.com/cover.jpg")
    private String coverImage;

    @Schema(description = "Publication status", example = "DRAFT")
    private ArticleStatus status;

    @Schema(description = "Category ID", example = "1")
    private Long categoryId;

    @Schema(description = "Tag IDs", example = "[1, 2]")
    private List<Long> tagIds;
}
