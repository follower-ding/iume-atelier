package com.iumeatelier.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Data
public class AiToolGenerateRequest {

    /** 用户自然语言描述，如「把 Playwright MCP 加到工具箱」 */
    @NotBlank
    @Size(max = 4000)
    private String message;

    /** 可选：粘贴的官方 README / 配置文档 */
    @Size(max = 20000)
    private String context;

    /** 多轮对话历史（不含当前 message） */
    private List<ChatMessageRequest> history = new ArrayList<>();
}
