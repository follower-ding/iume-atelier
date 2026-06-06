package com.iumeatelier.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class AiToolConfigRequest {

    @NotBlank
    private String id;

    @NotBlank
    private String title;

    @NotBlank
    private String content;
}
