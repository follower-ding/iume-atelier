package com.iumeatelier.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
@Schema(description = "Shared music track create/update")
public class SharedMusicTrackRequest {

    @NotBlank
    @Size(max = 200)
    private String title;

    @Size(max = 200)
    private String artist;

    @NotBlank
    @Size(max = 1000)
    private String src;

    @Size(max = 1000)
    private String cover;

    private Integer sortOrder;
}
