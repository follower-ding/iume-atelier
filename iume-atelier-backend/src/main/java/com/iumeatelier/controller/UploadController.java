package com.iumeatelier.controller;

import com.iumeatelier.common.Result;
import com.iumeatelier.dto.response.UploadResponse;
import com.iumeatelier.service.UploadService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/upload")
@RequiredArgsConstructor
@Tag(name = "Upload", description = "File upload for blog content")
public class UploadController {

    private final UploadService uploadService;

    @PostMapping("/image")
    @Operation(summary = "Upload an image (paste or file picker)")
    public Result<UploadResponse> uploadImage(@RequestParam("file") MultipartFile file) {
        return Result.success(uploadService.uploadImage(file));
    }

    @PostMapping("/audio")
    @Operation(summary = "Upload an audio track for community playlist")
    public Result<UploadResponse> uploadAudio(@RequestParam("file") MultipartFile file) {
        return Result.success(uploadService.uploadAudio(file));
    }
}
