package com.iumeatelier.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.iumeatelier.config.LlmProperties;
import com.iumeatelier.dto.request.AiToolGenerateRequest;
import com.iumeatelier.dto.request.AiToolRequest;
import com.iumeatelier.dto.request.ChatMessageRequest;
import com.iumeatelier.dto.response.AiToolGenerateResponse;
import com.iumeatelier.exception.BusinessException;
import com.iumeatelier.security.SecurityUtils;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validator;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class AiToolGenerateService {

    private static final String SYSTEM_PROMPT = """
            你是 iume-atelier 博客「AI 工具箱」的条目生成助手。
            用户会用自然语言描述想添加的 MCP、Cursor Skill、Prompt 或在线工具。
            你必须只输出一个 JSON 对象（不要 markdown 代码块），结构如下：
            {
              "summary": "一两句话说明你生成了什么",
              "draft": {
                "slug": "小写连字符 id，如 mcp-playwright",
                "name": "显示名称",
                "description": "卡片简介，50字内",
                "category": "mcp|skill|prompt|online",
                "icon": "单个 emoji",
                "tags": ["tag1", "tag2"],
                "url": "官方链接或 null",
                "featured": false,
                "source": "official|custom",
                "sortOrder": 0,
                "detail": {
                  "intro": "稍长介绍",
                  "features": ["功能1", "功能2"],
                  "install": ["安装步骤1", "安装步骤2"],
                  "setup": ["配置步骤1", "配置步骤2"],
                  "usage": ["日常用法1", "日常用法2"],
                  "configs": [{"id": "xxx-config", "title": "配置标题", "content": "完整可复制配置正文"}],
                  "related": []
                }
              }
            }
            规则：
            - MCP 类必须在 detail.configs 里给出完整 mcp.json 片段（含 mcpServers）
            - Skill/Prompt 类把 SKILL.md 或 Prompt 全文放进 configs[0].content
            - 步骤要具体可执行，中文
            - slug 仅小写字母数字和连字符
            - 若用户提供了官方文档，优先从中提取真实配置
            """;

    private final LlmClient llmClient;
    private final LlmProperties llmProperties;
    private final ObjectMapper objectMapper;
    private final Validator validator;

    public AiToolGenerateResponse generate(AiToolGenerateRequest request) {
        if (!SecurityUtils.isAdmin()) {
            throw new BusinessException(403, "Admin access required");
        }

        List<Map<String, String>> messages = new ArrayList<>();
        messages.add(Map.of("role", "system", "content", SYSTEM_PROMPT));

        if (request.getHistory() != null) {
            for (ChatMessageRequest h : request.getHistory()) {
                if (StringUtils.hasText(h.getRole()) && StringUtils.hasText(h.getContent())) {
                    messages.add(Map.of("role", h.getRole(), "content", h.getContent()));
                }
            }
        }

        StringBuilder userContent = new StringBuilder(request.getMessage().trim());
        if (StringUtils.hasText(request.getContext())) {
            userContent.append("\n\n--- 用户粘贴的参考文档 ---\n").append(request.getContext().trim());
        }
        messages.add(Map.of("role", "user", "content", userContent.toString()));

        String raw = llmClient.chat(messages);
        return parseResponse(raw);
    }

    private AiToolGenerateResponse parseResponse(String raw) {
        try {
            String json = extractJson(raw);
            JsonNode root = objectMapper.readTree(json);
            String summary = root.path("summary").asText("已生成工具草稿");
            JsonNode draftNode = root.path("draft");
            if (draftNode.isMissingNode()) {
                draftNode = root;
            }
            AiToolRequest draft = objectMapper.treeToValue(draftNode, AiToolRequest.class);
            validateDraft(draft);
            return AiToolGenerateResponse.builder()
                    .summary(summary)
                    .draft(draft)
                    .model(llmProperties.getModel())
                    .build();
        } catch (BusinessException e) {
            throw e;
        } catch (Exception e) {
            throw new BusinessException(502, "AI 返回格式无法解析，请换种说法重试: " + e.getMessage());
        }
    }

    private void validateDraft(AiToolRequest draft) {
        Set<ConstraintViolation<AiToolRequest>> violations = validator.validate(draft);
        if (!violations.isEmpty()) {
            String msg = violations.iterator().next().getMessage();
            throw new BusinessException(502, "AI 生成数据不完整: " + msg);
        }
    }

    private String extractJson(String raw) {
        String trimmed = raw.trim();
        Pattern block = Pattern.compile("```(?:json)?\\s*([\\s\\S]*?)```", Pattern.CASE_INSENSITIVE);
        Matcher m = block.matcher(trimmed);
        if (m.find()) {
            return m.group(1).trim();
        }
        int start = trimmed.indexOf('{');
        int end = trimmed.lastIndexOf('}');
        if (start >= 0 && end > start) {
            return trimmed.substring(start, end + 1);
        }
        return trimmed;
    }
}
