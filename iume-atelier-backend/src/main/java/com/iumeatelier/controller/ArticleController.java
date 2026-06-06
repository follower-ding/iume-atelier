package com.iumeatelier.controller;

import com.iumeatelier.common.PageResult;
import com.iumeatelier.common.Result;
import com.iumeatelier.dto.request.ArticleRequest;
import com.iumeatelier.dto.response.ArticleResponse;
import com.iumeatelier.enums.ArticleStatus;
import com.iumeatelier.security.SecurityUtils;
import com.iumeatelier.service.ArticleService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
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

@RestController
@RequestMapping("/articles")
@RequiredArgsConstructor
@Tag(name = "Articles", description = "Article CRUD and search")
public class ArticleController {

    private final ArticleService articleService;

    @GetMapping
    @Operation(summary = "List published articles (public)")
    public Result<PageResult<ArticleResponse>> listPublished(
            @Parameter(description = "Page number") @RequestParam(defaultValue = "1") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "10") int size,
            @Parameter(description = "Filter by category ID") @RequestParam(required = false) Long categoryId,
            @Parameter(description = "Filter by tag ID") @RequestParam(required = false) Long tagId,
            @Parameter(description = "Sort: latest or popular") @RequestParam(defaultValue = "latest") String sort) {
        return Result.success(articleService.listPublished(page, size, categoryId, tagId, sort));
    }

    @GetMapping("/manage")
    @Operation(summary = "List all articles for authenticated user (includes drafts)")
    public Result<PageResult<ArticleResponse>> listManage(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) ArticleStatus status,
            @RequestParam(required = false) Long authorId) {
        return Result.success(articleService.listAll(page, size, status, authorId));
    }

    @GetMapping("/search")
    @Operation(summary = "Search published articles by keyword")
    public Result<PageResult<ArticleResponse>> search(
            @Parameter(description = "Search keyword") @RequestParam String keyword,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size) {
        return Result.success(articleService.search(keyword, page, size));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get article by ID")
    public Result<ArticleResponse> getById(@PathVariable Long id) {
        return Result.success(articleService.getById(id, true));
    }

    @GetMapping("/slug/{slug}")
    @Operation(summary = "Get article by slug")
    public Result<ArticleResponse> getBySlug(@PathVariable String slug) {
        return Result.success(articleService.getBySlug(slug, true));
    }

    @PostMapping
    @Operation(summary = "Create a new article")
    public Result<ArticleResponse> create(@Valid @RequestBody ArticleRequest request) {
        Long authorId = SecurityUtils.getCurrentUserId();
        return Result.success(articleService.create(request, authorId));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update an article")
    public Result<ArticleResponse> update(@PathVariable Long id, @Valid @RequestBody ArticleRequest request) {
        return Result.success(articleService.update(id, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete an article")
    public Result<Void> delete(@PathVariable Long id) {
        articleService.delete(id);
        return Result.success();
    }
}
