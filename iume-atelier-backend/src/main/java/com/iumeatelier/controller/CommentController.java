package com.iumeatelier.controller;

import com.iumeatelier.common.Result;
import com.iumeatelier.dto.request.CommentRequest;
import com.iumeatelier.dto.response.CommentResponse;
import com.iumeatelier.security.SecurityUtils;
import com.iumeatelier.service.CommentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/comments")
@RequiredArgsConstructor
@Tag(name = "Comments", description = "Article comments")
public class CommentController {

    private final CommentService commentService;

    @GetMapping("/article/{articleId}")
    @Operation(summary = "List comments for an article")
    public Result<List<CommentResponse>> listByArticle(@PathVariable Long articleId) {
        return Result.success(commentService.listByArticle(articleId));
    }

    @PostMapping
    @Operation(summary = "Create a comment")
    public Result<CommentResponse> create(@Valid @RequestBody CommentRequest request) {
        Long userId = SecurityUtils.getCurrentUserId();
        return Result.success(commentService.create(request, userId));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a comment")
    public Result<Void> delete(@PathVariable Long id) {
        commentService.delete(id);
        return Result.success();
    }
}
