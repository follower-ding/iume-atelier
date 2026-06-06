package com.iumeatelier.controller;

import com.iumeatelier.common.PageResult;
import com.iumeatelier.common.Result;
import com.iumeatelier.dto.request.AdminUserCreateRequest;
import com.iumeatelier.dto.request.AdminUserUpdateRequest;
import com.iumeatelier.dto.request.BatchArticleStatusRequest;
import com.iumeatelier.dto.request.BatchIdsRequest;
import com.iumeatelier.dto.response.AdminAuditLogResponse;
import com.iumeatelier.dto.response.AdminCommentResponse;
import com.iumeatelier.dto.response.AdminStatsResponse;
import com.iumeatelier.dto.response.ArticleResponse;
import com.iumeatelier.dto.response.UserResponse;
import com.iumeatelier.enums.ArticleStatus;
import com.iumeatelier.security.SecurityUtils;
import com.iumeatelier.service.AdminAuditLogService;
import com.iumeatelier.service.AdminService;
import com.iumeatelier.service.ArticleService;
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

import java.util.Map;

@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
@Tag(name = "Admin Console", description = "Backend admin management APIs")
public class AdminController {

    private final AdminService adminService;
    private final AdminAuditLogService auditLogService;
    private final ArticleService articleService;

    @GetMapping("/stats")
    @Operation(summary = "Dashboard statistics")
    public Result<AdminStatsResponse> stats() {
        return Result.success(adminService.getStats());
    }

    @GetMapping("/users")
    @Operation(summary = "List all users")
    public Result<PageResult<UserResponse>> listUsers(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String keyword) {
        return Result.success(adminService.listUsers(page, size, keyword));
    }

    @PostMapping("/users")
    @Operation(summary = "Create user by admin")
    public Result<UserResponse> createUser(@Valid @RequestBody AdminUserCreateRequest request) {
        return Result.success(adminService.createUser(request));
    }

    @PutMapping("/users/{id}")
    @Operation(summary = "Update user by admin")
    public Result<UserResponse> updateUser(@PathVariable Long id, @Valid @RequestBody AdminUserUpdateRequest request) {
        return Result.success(adminService.updateUser(id, request));
    }

    @DeleteMapping("/users/{id}")
    @Operation(summary = "Delete user by admin")
    public Result<Void> deleteUser(@PathVariable Long id) {
        adminService.deleteUser(id);
        return Result.success();
    }

    @PostMapping("/users/batch-delete")
    @Operation(summary = "Batch delete users")
    public Result<Map<String, Integer>> batchDeleteUsers(@Valid @RequestBody BatchIdsRequest request) {
        int count = adminService.batchDeleteUsers(request.getIds());
        return Result.success(Map.of("deleted", count));
    }

    @GetMapping("/comments")
    @Operation(summary = "List all comments")
    public Result<PageResult<AdminCommentResponse>> listComments(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size) {
        return Result.success(adminService.listComments(page, size));
    }

    @PostMapping("/comments/batch-delete")
    @Operation(summary = "Batch delete comments")
    public Result<Map<String, Integer>> batchDeleteComments(@Valid @RequestBody BatchIdsRequest request) {
        int count = adminService.batchDeleteComments(request.getIds());
        return Result.success(Map.of("deleted", count));
    }

    @GetMapping("/articles")
    @Operation(summary = "List all articles for admin")
    public Result<PageResult<ArticleResponse>> listArticles(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) ArticleStatus status,
            @RequestParam(required = false) Long authorId) {
        SecurityUtils.requireAdmin();
        return Result.success(articleService.listAll(page, size, status, authorId));
    }

    @PostMapping("/articles/batch-delete")
    @Operation(summary = "Batch delete articles")
    public Result<Map<String, Integer>> batchDeleteArticles(@Valid @RequestBody BatchIdsRequest request) {
        int count = adminService.batchDeleteArticles(request.getIds());
        return Result.success(Map.of("deleted", count));
    }

    @PostMapping("/articles/batch-status")
    @Operation(summary = "Batch update article status")
    public Result<Map<String, Integer>> batchUpdateArticleStatus(@Valid @RequestBody BatchArticleStatusRequest request) {
        int count = adminService.batchUpdateArticleStatus(request);
        return Result.success(Map.of("updated", count));
    }

    @GetMapping("/audit-logs")
    @Operation(summary = "List admin audit logs")
    public Result<PageResult<AdminAuditLogResponse>> listAuditLogs(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size) {
        return Result.success(auditLogService.list(page, size));
    }
}
