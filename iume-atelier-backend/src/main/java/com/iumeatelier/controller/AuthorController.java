package com.iumeatelier.controller;

import com.iumeatelier.common.PageResult;
import com.iumeatelier.common.Result;
import com.iumeatelier.dto.response.ArticleResponse;
import com.iumeatelier.dto.response.UserResponse;
import com.iumeatelier.service.AuthorService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/authors")
@RequiredArgsConstructor
@Tag(name = "Authors", description = "Public author profiles")
public class AuthorController {

    private final AuthorService authorService;

    @GetMapping
    @Operation(summary = "List authors with published articles")
    public Result<java.util.List<UserResponse>> listAuthors() {
        return Result.success(authorService.listAuthors());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get author profile")
    public Result<UserResponse> getAuthor(@PathVariable Long id) {
        return Result.success(authorService.getAuthor(id));
    }

    @GetMapping("/{id}/articles")
    @Operation(summary = "List published articles by author")
    public Result<PageResult<ArticleResponse>> listArticles(
            @PathVariable Long id,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size) {
        return Result.success(authorService.listArticles(id, page, size));
    }
}
