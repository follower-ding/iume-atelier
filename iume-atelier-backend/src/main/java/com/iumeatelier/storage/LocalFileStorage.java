package com.iumeatelier.storage;

import com.iumeatelier.config.StorageProperties;
import com.iumeatelier.exception.BusinessException;
import lombok.Getter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@Slf4j
@Component
@ConditionalOnProperty(name = "iume.storage.type", havingValue = "local", matchIfMissing = true)
public class LocalFileStorage implements FileStorage {

    @Getter
    private final Path uploadDir;

    public LocalFileStorage(StorageProperties properties) {
        this.uploadDir = Paths.get(properties.getLocal().getDir()).toAbsolutePath().normalize();
        try {
            Files.createDirectories(uploadDir);
        } catch (IOException e) {
            throw new IllegalStateException("Cannot create upload directory: " + uploadDir, e);
        }
    }

    @Override
    public StoredFile store(MultipartFile file, String storedName, String contentType) {
        try {
            Path target = uploadDir.resolve(storedName);
            file.transferTo(target.toFile());
            String url = "/api/uploads/" + storedName;
            log.info("Local upload: {} -> {}", file.getOriginalFilename(), url);
            return new StoredFile(url, storedName);
        } catch (IOException e) {
            log.error("Local upload failed", e);
            throw new BusinessException("文件上传失败");
        }
    }
}
