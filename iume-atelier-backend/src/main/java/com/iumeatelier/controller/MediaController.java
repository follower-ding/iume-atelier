package com.iumeatelier.controller;

import com.iumeatelier.common.PageResult;
import com.iumeatelier.common.Result;
import com.iumeatelier.dto.response.MediaAssetResponse;
import com.iumeatelier.service.MediaAssetService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/media")
@RequiredArgsConstructor
@Tag(name = "Media", description = "Media library management")
public class MediaController {

    private final MediaAssetService mediaAssetService;

    @GetMapping
    @Operation(summary = "List uploaded media assets (admin)")
    public Result<PageResult<MediaAssetResponse>> list(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size) {
        return Result.success(mediaAssetService.list(page, size));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete media asset (admin)")
    public Result<Void> delete(@PathVariable Long id) {
        mediaAssetService.delete(id);
        return Result.success();
    }
}
