package com.iumeatelier.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
@Schema(description = "Tag create/update request")
public class TagRequest {

    @NotBlank(message = "Name is required")
    @Size(max = 50, message = "Name must not exceed 50 characters")
    @Schema(description = "Tag name", example = "Java")
    private String name;

    @NotBlank(message = "Slug is required")
    @Size(max = 50, message = "Slug must not exceed 50 characters")
    @Schema(description = "URL slug", example = "java")
    private String slug;
}
