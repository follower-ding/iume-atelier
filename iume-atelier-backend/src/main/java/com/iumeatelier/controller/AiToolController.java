package com.iumeatelier.controller;

import com.iumeatelier.common.PageResult;
import com.iumeatelier.common.Result;
import com.iumeatelier.dto.request.AiToolGenerateRequest;
import com.iumeatelier.dto.request.AiToolRequest;
import com.iumeatelier.dto.response.AiToolGenerateResponse;
import com.iumeatelier.dto.response.AiToolResponse;
import com.iumeatelier.service.AiToolGenerateService;
import com.iumeatelier.service.AiToolService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/ai-tools")
@RequiredArgsConstructor
@Tag(name = "AI Tools", description = "AI toolbox entries")
public class AiToolController {

    private final AiToolService aiToolService;
    private final AiToolGenerateService aiToolGenerateService;

    @GetMapping
    @Operation(summary = "List AI tools")
    public Result<List<AiToolResponse>> list(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String keyword) {
        return Result.success(aiToolService.listAll(category, keyword));
    }

    @GetMapping("/page")
    @Operation(summary = "Paginated AI tools (admin console)")
    public Result<PageResult<AiToolResponse>> page(
            @RequestParam(defaultValue = "1") long page,
            @RequestParam(defaultValue = "20") long size,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String keyword) {
        return Result.success(aiToolService.listPage(page, size, category, keyword));
    }

    @GetMapping("/{slug}")
    @Operation(summary = "Get AI tool by slug")
    public Result<AiToolResponse> getBySlug(@PathVariable String slug) {
        return Result.success(aiToolService.getBySlug(slug));
    }

    @PostMapping("/generate")
    @Operation(summary = "Generate AI tool draft from natural language (admin)")
    public Result<AiToolGenerateResponse> generate(@Valid @RequestBody AiToolGenerateRequest request) {
        return Result.success(aiToolGenerateService.generate(request));
    }

    @PostMapping
    @Operation(summary = "Create AI tool (admin)")
    public Result<AiToolResponse> create(@Valid @RequestBody AiToolRequest request) {
        return Result.success(aiToolService.create(request));
    }

    @PutMapping("/{slug}")
    @Operation(summary = "Update AI tool (admin)")
    public Result<AiToolResponse> update(@PathVariable String slug, @Valid @RequestBody AiToolRequest request) {
        return Result.success(aiToolService.update(slug, request));
    }

    @PostMapping("/upsert")
    @Operation(summary = "Create or update AI tool by slug (admin / MCP)")
    public Result<AiToolResponse> upsert(@Valid @RequestBody AiToolRequest request) {
        return Result.success(aiToolService.upsert(request));
    }

    @DeleteMapping("/{slug}")
    @Operation(summary = "Delete AI tool (admin)")
    public Result<Void> delete(@PathVariable String slug) {
        aiToolService.delete(slug);
        return Result.success();
    }
}
