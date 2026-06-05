package com.iumeatelier.dto.response;

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
@Schema(description = "Comment response")
public class CommentResponse {

    @Schema(description = "Comment ID", example = "1")
    private Long id;

    @Schema(description = "Article ID", example = "1")
    private Long articleId;

    @Schema(description = "User ID", example = "1")
    private Long userId;

    @Schema(description = "Username", example = "admin")
    private String username;

    @Schema(description = "Nickname", example = "Admin")
    private String nickname;

    @Schema(description = "Comment content")
    private String content;

    @Schema(description = "Parent comment ID")
    private Long parentId;

    @Schema(description = "Created at")
    private LocalDateTime createdAt;

    @Schema(description = "Reply comments")
    private List<CommentResponse> replies;
}
