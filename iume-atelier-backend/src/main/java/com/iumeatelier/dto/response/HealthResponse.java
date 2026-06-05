package com.iumeatelier.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Health check response")
public class HealthResponse {

    @Schema(description = "Service status", example = "UP")
    private String status;

    @Schema(description = "Application version", example = "1.0.0")
    private String version;
}
