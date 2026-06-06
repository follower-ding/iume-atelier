package com.iumeatelier.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.util.List;

@Data
@Schema(description = "Batch update article status")
public class BatchArticleStatusRequest {

    @NotEmpty(message = "IDs are required")
    private List<Long> ids;

    @NotBlank(message = "Status is required")
    @Schema(description = "DRAFT or PUBLISHED")
    private String status;
}
