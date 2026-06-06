package com.iumeatelier.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
@Schema(description = "Custom music track metadata")
public class CustomMusicTrackRequest {

    @NotBlank
    @Size(max = 64)
    private String id;

    @NotBlank
    @Size(max = 120)
    private String title;

    @Size(max = 80)
    private String artist;

    @NotBlank
    @Size(max = 500)
    private String src;

    @Size(max = 40)
    private String createdAt;
}
