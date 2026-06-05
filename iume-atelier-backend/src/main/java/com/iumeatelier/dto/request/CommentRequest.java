package com.iumeatelier.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
@Schema(description = "Comment create request")
public class CommentRequest {

    @NotNull(message = "Article ID is required")
    @Schema(description = "Article ID", example = "1")
    private Long articleId;

    @NotBlank(message = "Content is required")
    @Schema(description = "Comment content", example = "Great article!")
    private String content;

    @Schema(description = "Parent comment ID for replies", example = "5")
    private Long parentId;
}
