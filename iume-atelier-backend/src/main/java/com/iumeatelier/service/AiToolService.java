package com.iumeatelier.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.iumeatelier.common.PageResult;
import com.iumeatelier.dto.request.AiToolConfigRequest;
import com.iumeatelier.dto.request.AiToolDetailRequest;
import com.iumeatelier.dto.request.AiToolRequest;
import com.iumeatelier.dto.response.AiToolConfigResponse;
import com.iumeatelier.dto.response.AiToolDetailResponse;
import com.iumeatelier.dto.response.AiToolResponse;
import com.iumeatelier.entity.AiTool;
import com.iumeatelier.exception.BusinessException;
import com.iumeatelier.mapper.AiToolMapper;
import com.iumeatelier.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.Collections;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AiToolService {

    private final AiToolMapper aiToolMapper;
    private final ObjectMapper objectMapper;
    private final AdminAuditLogService auditLogService;

    public List<AiToolResponse> listAll(String category, String keyword) {
        LambdaQueryWrapper<AiTool> wrapper = baseQuery(category, keyword);
        wrapper.orderByDesc(AiTool::getFeatured)
                .orderByAsc(AiTool::getSortOrder)
                .orderByAsc(AiTool::getName);
        return aiToolMapper.selectList(wrapper).stream().map(this::toResponse).toList();
    }

    public PageResult<AiToolResponse> listPage(long page, long size, String category, String keyword) {
        LambdaQueryWrapper<AiTool> wrapper = baseQuery(category, keyword);
        wrapper.orderByDesc(AiTool::getFeatured)
                .orderByAsc(AiTool::getSortOrder)
                .orderByDesc(AiTool::getUpdatedAt);
        Page<AiTool> result = aiToolMapper.selectPage(new Page<>(page, size), wrapper);
        return PageResult.of(page, size, result.getTotal(),
                result.getRecords().stream().map(this::toResponse).toList());
    }

    public AiToolResponse getBySlug(String slug) {
        AiTool tool = findBySlug(slug);
        if (tool == null) {
            throw new BusinessException(404, "AI tool not found");
        }
        return toResponse(tool);
    }

    public AiToolResponse create(AiToolRequest request) {
        requireAdmin();
        validateUniqueSlug(request.getSlug(), null);
        AiTool tool = fromRequest(new AiTool(), request);
        aiToolMapper.insert(tool);
        auditLogService.log("CREATE_AI_TOOL", "AI_TOOL", tool.getId(), tool.getSlug());
        return toResponse(tool);
    }

    public AiToolResponse update(String slug, AiToolRequest request) {
        requireAdmin();
        AiTool tool = findBySlug(slug);
        if (tool == null) {
            throw new BusinessException(404, "AI tool not found");
        }
        if (!tool.getSlug().equals(request.getSlug())) {
            validateUniqueSlug(request.getSlug(), tool.getId());
        }
        fromRequest(tool, request);
        aiToolMapper.updateById(tool);
        auditLogService.log("UPDATE_AI_TOOL", "AI_TOOL", tool.getId(), tool.getSlug());
        return toResponse(tool);
    }

    public AiToolResponse upsert(AiToolRequest request) {
        requireAdmin();
        AiTool existing = findBySlug(request.getSlug());
        if (existing == null) {
            return create(request);
        }
        fromRequest(existing, request);
        aiToolMapper.updateById(existing);
        auditLogService.log("UPSERT_AI_TOOL", "AI_TOOL", existing.getId(), existing.getSlug());
        return toResponse(existing);
    }

    public void delete(String slug) {
        requireAdmin();
        AiTool tool = findBySlug(slug);
        if (tool == null) {
            throw new BusinessException(404, "AI tool not found");
        }
        aiToolMapper.deleteById(tool.getId());
        auditLogService.log("DELETE_AI_TOOL", "AI_TOOL", tool.getId(), tool.getSlug());
    }

    private LambdaQueryWrapper<AiTool> baseQuery(String category, String keyword) {
        LambdaQueryWrapper<AiTool> wrapper = new LambdaQueryWrapper<>();
        if (StringUtils.hasText(category) && !"all".equalsIgnoreCase(category)) {
            wrapper.eq(AiTool::getCategory, category);
        }
        if (StringUtils.hasText(keyword)) {
            String q = keyword.trim();
            wrapper.and(w -> w.like(AiTool::getName, q)
                    .or().like(AiTool::getDescription, q)
                    .or().like(AiTool::getSlug, q));
        }
        return wrapper;
    }

    private AiTool findBySlug(String slug) {
        return aiToolMapper.selectOne(new LambdaQueryWrapper<AiTool>().eq(AiTool::getSlug, slug));
    }

    private void validateUniqueSlug(String slug, Long excludeId) {
        LambdaQueryWrapper<AiTool> wrapper = new LambdaQueryWrapper<AiTool>().eq(AiTool::getSlug, slug);
        if (excludeId != null) {
            wrapper.ne(AiTool::getId, excludeId);
        }
        if (aiToolMapper.selectCount(wrapper) > 0) {
            throw new BusinessException("AI tool slug already exists");
        }
    }

    private void requireAdmin() {
        if (!SecurityUtils.isAdmin()) {
            throw new BusinessException(403, "Admin access required");
        }
    }

    private AiTool fromRequest(AiTool tool, AiToolRequest request) {
        tool.setSlug(request.getSlug().trim());
        tool.setName(request.getName().trim());
        tool.setDescription(request.getDescription().trim());
        tool.setCategory(request.getCategory());
        tool.setIcon(request.getIcon());
        tool.setTagsJson(writeJson(request.getTags() != null ? request.getTags() : Collections.emptyList()));
        tool.setUrl(StringUtils.hasText(request.getUrl()) ? request.getUrl().trim() : null);
        tool.setFeatured(Boolean.TRUE.equals(request.getFeatured()));
        tool.setSource(StringUtils.hasText(request.getSource()) ? request.getSource() : "official");
        tool.setDetailJson(writeJson(request.getDetail()));
        tool.setSortOrder(request.getSortOrder() != null ? request.getSortOrder() : 0);
        return tool;
    }

    private AiToolResponse toResponse(AiTool tool) {
        return AiToolResponse.builder()
                .id(tool.getId())
                .slug(tool.getSlug())
                .name(tool.getName())
                .description(tool.getDescription())
                .category(tool.getCategory())
                .icon(tool.getIcon())
                .tags(readStringList(tool.getTagsJson()))
                .url(tool.getUrl())
                .featured(Boolean.TRUE.equals(tool.getFeatured()))
                .source(tool.getSource())
                .detail(readDetail(tool.getDetailJson()))
                .sortOrder(tool.getSortOrder())
                .createdAt(tool.getCreatedAt())
                .updatedAt(tool.getUpdatedAt())
                .build();
    }

    private AiToolDetailResponse readDetail(String json) {
        if (!StringUtils.hasText(json)) {
            return AiToolDetailResponse.builder()
                    .features(Collections.emptyList())
                    .usage(Collections.emptyList())
                    .build();
        }
        try {
            AiToolDetailRequest detail = objectMapper.readValue(json, AiToolDetailRequest.class);
            return AiToolDetailResponse.builder()
                    .intro(detail.getIntro())
                    .features(detail.getFeatures())
                    .install(detail.getInstall())
                    .setup(detail.getSetup())
                    .usage(detail.getUsage())
                    .configs(detail.getConfigs() == null ? Collections.emptyList() :
                            detail.getConfigs().stream().map(c -> AiToolConfigResponse.builder()
                                    .id(c.getId())
                                    .title(c.getTitle())
                                    .content(c.getContent())
                                    .build()).toList())
                    .related(detail.getRelated())
                    .build();
        } catch (JsonProcessingException e) {
            throw new BusinessException("Invalid AI tool detail JSON");
        }
    }

    @SuppressWarnings("unchecked")
    private List<String> readStringList(String json) {
        if (!StringUtils.hasText(json)) {
            return Collections.emptyList();
        }
        try {
            return objectMapper.readValue(json, List.class);
        } catch (JsonProcessingException e) {
            return Collections.emptyList();
        }
    }

    private String writeJson(Object value) {
        try {
            return objectMapper.writeValueAsString(value);
        } catch (JsonProcessingException e) {
            throw new BusinessException("Failed to serialize AI tool data");
        }
    }
}
