package com.iumeatelier.controller;

import com.iumeatelier.common.PageResult;
import com.iumeatelier.common.Result;
import com.iumeatelier.dto.request.SeriesRequest;
import com.iumeatelier.dto.response.SeriesResponse;
import com.iumeatelier.service.SeriesService;
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
@RequestMapping("/series")
@RequiredArgsConstructor
@Tag(name = "Series", description = "Article series / topics")
public class SeriesController {

    private final SeriesService seriesService;

    @GetMapping
    @Operation(summary = "List published series")
    public Result<PageResult<SeriesResponse>> list(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size) {
        return Result.success(seriesService.listPublished(page, size));
    }

    @GetMapping("/slug/{slug}")
    @Operation(summary = "Get series with articles by slug")
    public Result<SeriesResponse> getBySlug(@PathVariable String slug) {
        return Result.success(seriesService.getBySlug(slug));
    }

    @GetMapping("/manage")
    @Operation(summary = "List all series for admin")
    public Result<PageResult<SeriesResponse>> listManage(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size) {
        return Result.success(seriesService.listManage(page, size));
    }

    @GetMapping("/brief")
    @Operation(summary = "Brief series list for article editor")
    public Result<List<SeriesResponse>> listBrief() {
        return Result.success(seriesService.listAllBrief());
    }

    @PostMapping
    @Operation(summary = "Create series (admin)")
    public Result<SeriesResponse> create(@Valid @RequestBody SeriesRequest request) {
        return Result.success(seriesService.create(request));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update series (admin)")
    public Result<SeriesResponse> update(@PathVariable Long id, @Valid @RequestBody SeriesRequest request) {
        return Result.success(seriesService.update(id, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete series (admin)")
    public Result<Void> delete(@PathVariable Long id) {
        seriesService.delete(id);
        return Result.success();
    }
}
