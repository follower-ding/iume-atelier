package com.iumeatelier.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ChatMessageRequest {

    @NotBlank
    private String role;

    @NotBlank
    private String content;
}
