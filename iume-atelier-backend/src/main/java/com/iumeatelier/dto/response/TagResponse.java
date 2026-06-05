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
@Schema(description = "Tag response")
public class TagResponse {

    @Schema(description = "Tag ID", example = "1")
    private Long id;

    @Schema(description = "Name", example = "Java")
    private String name;

    @Schema(description = "Slug", example = "java")
    private String slug;

    @Schema(description = "Created at")
    private LocalDateTime createdAt;
}
