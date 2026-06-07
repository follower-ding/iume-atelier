package com.iumeatelier.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;

@Data
@ConfigurationProperties(prefix = "iume.storage")
public class StorageProperties {

    /** local | s3 — s3 用于 Cloudflare R2 / AWS S3 兼容存储 */
    private String type = "local";

    private Local local = new Local();

    private S3 s3 = new S3();

    public boolean isS3() {
        return "s3".equalsIgnoreCase(type);
    }

    @Data
    public static class Local {
        private String dir = "uploads";
    }

    @Data
    public static class S3 {
        private String endpoint = "";
        private String region = "auto";
        private String bucket = "";
        private String accessKey = "";
        private String secretKey = "";
        /** 公网访问前缀，如 https://pub-xxx.r2.dev 或自定义域名 */
        private String publicBaseUrl = "";
        private String prefix = "uploads/";
    }
}
