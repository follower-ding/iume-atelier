package com.iumeatelier.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
@Schema(description = "Category create/update request")
public class CategoryRequest {

    @NotBlank(message = "Name is required")
    @Size(max = 50, message = "Name must not exceed 50 characters")
    @Schema(description = "Category name", example = "Technology")
    private String name;

    @NotBlank(message = "Slug is required")
    @Size(max = 50, message = "Slug must not exceed 50 characters")
    @Schema(description = "URL slug", example = "technology")
    private String slug;

    @Size(max = 255, message = "Description must not exceed 255 characters")
    @Schema(description = "Category description", example = "Tech articles")
    private String description;
}
