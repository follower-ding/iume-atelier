package com.iumeatelier.controller;

import com.iumeatelier.common.Result;
import com.iumeatelier.dto.request.TagRequest;
import com.iumeatelier.dto.response.TagResponse;
import com.iumeatelier.service.TagService;
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
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/tags")
@RequiredArgsConstructor
@Tag(name = "Tags", description = "Tag management")
public class TagController {

    private final TagService tagService;

    @GetMapping
    @Operation(summary = "List all tags")
    public Result<List<TagResponse>> list() {
        return Result.success(tagService.listAll());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get tag by ID")
    public Result<TagResponse> getById(@PathVariable Long id) {
        return Result.success(tagService.getById(id));
    }

    @PostMapping
    @Operation(summary = "Create a tag")
    public Result<TagResponse> create(@Valid @RequestBody TagRequest request) {
        return Result.success(tagService.create(request));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a tag")
    public Result<TagResponse> update(@PathVariable Long id, @Valid @RequestBody TagRequest request) {
        return Result.success(tagService.update(id, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a tag")
    public Result<Void> delete(@PathVariable Long id) {
        tagService.delete(id);
        return Result.success();
    }
}
