package com.iumeatelier.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Data
@Component
@ConfigurationProperties(prefix = "iume.llm")
public class LlmProperties {

    /** 是否启用对话生成（未配置 API Key 时自动关闭） */
    private boolean enabled = true;

    /** DeepSeek API Key，环境变量 IUME_LLM_API_KEY */
    private String apiKey = "";

    /** OpenAI 兼容接口地址 */
    private String baseUrl = "https://api.deepseek.com";

    /** 推荐：deepseek-chat，性价比高、中文好 */
    private String model = "deepseek-chat";

    private int maxTokens = 4096;

    private double temperature = 0.3;
}
