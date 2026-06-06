package com.iumeatelier.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
@Schema(description = "Admin audit log entry")
public class AdminAuditLogResponse {

    private Long id;
    private Long adminId;
    private String adminUsername;
    private String action;
    private String resourceType;
    private Long resourceId;
    private String detail;
    private LocalDateTime createdAt;
}
