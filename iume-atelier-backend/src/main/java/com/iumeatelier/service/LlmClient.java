package com.iumeatelier.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.iumeatelier.config.LlmProperties;
import com.iumeatelier.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestClient;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class LlmClient {

    private final LlmProperties properties;
    private final ObjectMapper objectMapper;
    private final RestClient restClient = RestClient.create();

    public String chat(List<Map<String, String>> messages) {
        if (!properties.isEnabled() || !StringUtils.hasText(properties.getApiKey())) {
            throw new BusinessException(503, "AI 未配置：请在 Railway 设置环境变量 IUME_LLM_API_KEY（DeepSeek API Key）");
        }

        String base = properties.getBaseUrl().replaceAll("/$", "");
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("model", properties.getModel());
        body.put("messages", messages);
        body.put("temperature", properties.getTemperature());
        body.put("max_tokens", properties.getMaxTokens());
        body.put("response_format", Map.of("type", "json_object"));

        try {
            String response = restClient.post()
                    .uri(base + "/v1/chat/completions")
                    .contentType(MediaType.APPLICATION_JSON)
                    .header("Authorization", "Bearer " + properties.getApiKey())
                    .body(objectMapper.writeValueAsString(body))
                    .retrieve()
                    .body(String.class);

            JsonNode root = objectMapper.readTree(response);
            JsonNode content = root.path("choices").path(0).path("message").path("content");
            if (content.isMissingNode() || !StringUtils.hasText(content.asText())) {
                throw new BusinessException("AI 返回为空");
            }
            return content.asText();
        } catch (BusinessException e) {
            throw e;
        } catch (Exception e) {
            throw new BusinessException(502, "AI 调用失败: " + e.getMessage());
        }
    }

    public static List<Map<String, String>> message(String role, String content) {
        List<Map<String, String>> list = new ArrayList<>();
        list.add(Map.of("role", role, "content", content));
        return list;
    }
}
