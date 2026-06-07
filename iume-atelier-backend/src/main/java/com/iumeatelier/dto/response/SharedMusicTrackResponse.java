package com.iumeatelier.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
@Schema(description = "Site-wide shared music track")
public class SharedMusicTrackResponse {

    private Long id;
    private String title;
    private String artist;
    private String src;
    private String cover;
    private Integer sortOrder;
    private LocalDateTime createdAt;
    private Long uploaderId;
}
