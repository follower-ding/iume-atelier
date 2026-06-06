package com.iumeatelier.service;

import com.iumeatelier.dto.response.UploadResponse;
import com.iumeatelier.exception.BusinessException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Set;
import java.util.UUID;

@Slf4j
@Service
public class UploadService {

    private static final Set<String> ALLOWED_IMAGE_TYPES = Set.of(
            "image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml"
    );

    private static final Set<String> ALLOWED_AUDIO_TYPES = Set.of(
            "audio/mpeg", "audio/mp3", "audio/wav", "audio/ogg", "audio/mp4", "audio/x-m4a", "audio/aac"
    );

    private static final long MAX_IMAGE_SIZE = 10 * 1024 * 1024;
    private static final long MAX_AUDIO_SIZE = 15 * 1024 * 1024;

    private final Path uploadDir;

    public UploadService(@Value("${iume.upload.dir:uploads}") String uploadDir) {
        this.uploadDir = Paths.get(uploadDir).toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.uploadDir);
        } catch (IOException e) {
            throw new IllegalStateException("Cannot create upload directory: " + this.uploadDir, e);
        }
    }

    public UploadResponse uploadImage(MultipartFile file) {
        return uploadFile(file, ALLOWED_IMAGE_TYPES, MAX_IMAGE_SIZE, "图片", "图片上传失败");
    }

    public UploadResponse uploadAudio(MultipartFile file) {
        return uploadFile(file, ALLOWED_AUDIO_TYPES, MAX_AUDIO_SIZE, "音频", "音频上传失败");
    }

    private UploadResponse uploadFile(
            MultipartFile file,
            Set<String> allowedTypes,
            long maxSize,
            String label,
            String failMessage
    ) {
        if (file == null || file.isEmpty()) {
            throw new BusinessException("请选择要上传的" + label);
        }
        if (file.getSize() > maxSize) {
            throw new BusinessException(label + "大小不能超过 " + (maxSize / 1024 / 1024) + "MB");
        }

        String contentType = file.getContentType();
        if (contentType == null || !allowedTypes.contains(contentType)) {
            throw new BusinessException("不支持的" + label + "格式");
        }

        String ext = extensionFromContentType(contentType);
        String storedName = UUID.randomUUID().toString().replace("-", "") + ext;

        try {
            Path target = uploadDir.resolve(storedName);
            file.transferTo(target.toFile());
            String url = "/api/uploads/" + storedName;
            log.info("Uploaded {}: {} -> {}", label, file.getOriginalFilename(), url);
            return new UploadResponse(url, file.getOriginalFilename());
        } catch (IOException e) {
            log.error("Upload failed", e);
            throw new BusinessException(failMessage);
        }
    }

    public Path getUploadDir() {
        return uploadDir;
    }

    private String extensionFromContentType(String contentType) {
        return switch (contentType) {
            case "image/jpeg" -> ".jpg";
            case "image/png" -> ".png";
            case "image/gif" -> ".gif";
            case "image/webp" -> ".webp";
            case "image/svg+xml" -> ".svg";
            case "audio/mpeg", "audio/mp3" -> ".mp3";
            case "audio/wav" -> ".wav";
            case "audio/ogg" -> ".ogg";
            case "audio/mp4", "audio/x-m4a" -> ".m4a";
            case "audio/aac" -> ".aac";
            default -> ".bin";
        };
    }
}
