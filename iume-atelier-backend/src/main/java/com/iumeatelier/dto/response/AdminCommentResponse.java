package com.iumeatelier.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Comment row for admin console")
public class AdminCommentResponse {

    private Long id;
    private Long articleId;
    private String articleTitle;
    private String articleSlug;
    private Long userId;
    private String username;
    private String nickname;
    private String content;
    private Long parentId;
    private LocalDateTime createdAt;
}
