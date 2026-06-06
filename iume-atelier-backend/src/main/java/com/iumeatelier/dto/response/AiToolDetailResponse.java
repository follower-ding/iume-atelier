package com.iumeatelier.dto.response;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class AiToolDetailResponse {
    private String intro;
    private List<String> features;
    private List<String> install;
    private List<String> setup;
    private List<String> usage;
    private List<AiToolConfigResponse> configs;
    private List<String> related;
}
