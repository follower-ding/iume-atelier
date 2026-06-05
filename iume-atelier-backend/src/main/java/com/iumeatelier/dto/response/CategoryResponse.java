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
@Schema(description = "Category response")
public class CategoryResponse {

    @Schema(description = "Category ID", example = "1")
    private Long id;

    @Schema(description = "Name", example = "Technology")
    private String name;

    @Schema(description = "Slug", example = "technology")
    private String slug;

    @Schema(description = "Description")
    private String description;

    @Schema(description = "Created at")
    private LocalDateTime createdAt;
}
