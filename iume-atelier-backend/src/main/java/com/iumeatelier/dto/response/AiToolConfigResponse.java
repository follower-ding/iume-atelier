package com.iumeatelier.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AiToolConfigResponse {
    private String id;
    private String title;
    private String content;
}
