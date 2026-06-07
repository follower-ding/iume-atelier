package com.iumeatelier.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class PageViewRequest {

    @NotBlank
    @Size(max = 500)
    private String path;

    private Long articleId;

    @Size(max = 1000)
    private String referrer;
}
