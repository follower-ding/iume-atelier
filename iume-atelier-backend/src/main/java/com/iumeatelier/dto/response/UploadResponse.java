package com.iumeatelier.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
@Schema(description = "Upload response with public URL")
public class UploadResponse {

    @Schema(description = "Public URL to access the uploaded file", example = "/api/uploads/abc123.png")
    private String url;

    @Schema(description = "Original filename", example = "screenshot.png")
    private String filename;
}
