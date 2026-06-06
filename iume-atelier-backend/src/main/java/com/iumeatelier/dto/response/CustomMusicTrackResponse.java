package com.iumeatelier.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Custom music track metadata")
public class CustomMusicTrackResponse {

    private String id;
    private String title;
    private String artist;
    private String src;
    private String createdAt;
}
