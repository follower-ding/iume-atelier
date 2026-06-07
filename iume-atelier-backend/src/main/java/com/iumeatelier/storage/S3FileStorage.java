package com.iumeatelier.storage;

import com.iumeatelier.config.StorageProperties;
import com.iumeatelier.exception.BusinessException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.S3Configuration;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.io.IOException;
import java.net.URI;

@Slf4j
@Component
@ConditionalOnProperty(name = "iume.storage.type", havingValue = "s3")
public class S3FileStorage implements FileStorage {

    private final S3Client s3;
    private final StorageProperties.S3 config;

    public S3FileStorage(StorageProperties properties) {
        this.config = properties.getS3();
        validateConfig();

        var credentials = AwsBasicCredentials.create(config.getAccessKey(), config.getSecretKey());
        var s3Config = S3Configuration.builder().pathStyleAccessEnabled(true).build();

        this.s3 = S3Client.builder()
                .endpointOverride(URI.create(config.getEndpoint()))
                .region(Region.of(config.getRegion()))
                .credentialsProvider(StaticCredentialsProvider.create(credentials))
                .serviceConfiguration(s3Config)
                .build();
    }

    private void validateConfig() {
        if (config.getEndpoint() == null || config.getEndpoint().isBlank()) {
            throw new IllegalStateException("iume.storage.s3.endpoint is required when type=s3");
        }
        if (config.getBucket() == null || config.getBucket().isBlank()) {
            throw new IllegalStateException("iume.storage.s3.bucket is required when type=s3");
        }
        if (config.getPublicBaseUrl() == null || config.getPublicBaseUrl().isBlank()) {
            throw new IllegalStateException("iume.storage.s3.public-base-url is required when type=s3");
        }
    }

    @Override
    public StoredFile store(MultipartFile file, String storedName, String contentType) {
        String key = normalizePrefix(config.getPrefix()) + storedName;
        try {
            var request = PutObjectRequest.builder()
                    .bucket(config.getBucket())
                    .key(key)
                    .contentType(contentType)
                    .build();
            s3.putObject(request, RequestBody.fromInputStream(file.getInputStream(), file.getSize()));
            String base = config.getPublicBaseUrl().replaceAll("/+$", "");
            String url = base + "/" + key;
            log.info("S3 upload: {} -> {}", file.getOriginalFilename(), url);
            return new StoredFile(url, storedName);
        } catch (IOException e) {
            log.error("S3 upload failed", e);
            throw new BusinessException("对象存储上传失败");
        }
    }

    private static String normalizePrefix(String prefix) {
        if (prefix == null || prefix.isBlank()) return "";
        return prefix.endsWith("/") ? prefix : prefix + "/";
    }
}
