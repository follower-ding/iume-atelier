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

    private static final Set<String> ALLOWED_TYPES = Set.of(
            "image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml"
    );

    private static final long MAX_SIZE = 10 * 1024 * 1024;

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
        if (file == null || file.isEmpty()) {
            throw new BusinessException("请选择要上传的图片");
        }
        if (file.getSize() > MAX_SIZE) {
            throw new BusinessException("图片大小不能超过 10MB");
        }

        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_TYPES.contains(contentType)) {
            throw new BusinessException("仅支持 JPG、PNG、GIF、WebP、SVG 格式");
        }

        String ext = extensionFromContentType(contentType);
        String storedName = UUID.randomUUID().toString().replace("-", "") + ext;

        try {
            Path target = uploadDir.resolve(storedName);
            file.transferTo(target.toFile());
            String url = "/api/uploads/" + storedName;
            log.info("Uploaded image: {} -> {}", file.getOriginalFilename(), url);
            return new UploadResponse(url, file.getOriginalFilename());
        } catch (IOException e) {
            log.error("Upload failed", e);
            throw new BusinessException("图片上传失败");
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
            default -> ".bin";
        };
    }
}
