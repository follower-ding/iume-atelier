package com.iumeatelier.controller;

import com.iumeatelier.common.Result;
import com.iumeatelier.dto.request.SharedMusicTrackRequest;
import com.iumeatelier.dto.response.SharedMusicTrackResponse;
import com.iumeatelier.service.SharedMusicService;
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
@RequestMapping("/music/shared")
@RequiredArgsConstructor
@Tag(name = "SharedMusic", description = "Community music catalog (all users contribute)")
public class SharedMusicController {

    private final SharedMusicService sharedMusicService;

    @GetMapping
    @Operation(summary = "List shared music tracks (public)")
    public Result<List<SharedMusicTrackResponse>> list() {
        return Result.success(sharedMusicService.listPublic());
    }

    @PostMapping
    @Operation(summary = "Add shared track (admin)")
    public Result<SharedMusicTrackResponse> create(@Valid @RequestBody SharedMusicTrackRequest request) {
        return Result.success(sharedMusicService.create(request));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update shared track (admin)")
    public Result<SharedMusicTrackResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody SharedMusicTrackRequest request) {
        return Result.success(sharedMusicService.update(id, request));
    }

    @PostMapping("/from-media/{mediaId}")
    @Operation(summary = "Add shared track from media library (admin)")
    public Result<SharedMusicTrackResponse> createFromMedia(@PathVariable Long mediaId) {
        return Result.success(sharedMusicService.createFromMedia(mediaId));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete shared track (admin)")
    public Result<Void> delete(@PathVariable Long id) {
        sharedMusicService.delete(id);
        return Result.success();
    }
}
