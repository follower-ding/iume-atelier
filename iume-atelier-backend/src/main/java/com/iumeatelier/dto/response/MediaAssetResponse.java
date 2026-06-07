package com.iumeatelier.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MediaAssetResponse {

    private Long id;
    private String storedName;
    private String originalName;
    private String contentType;
    private Long sizeBytes;
    private String publicUrl;
    private Long uploaderId;
    private LocalDateTime createdAt;
}
