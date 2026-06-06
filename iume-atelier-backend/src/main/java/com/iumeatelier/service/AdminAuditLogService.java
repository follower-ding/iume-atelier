package com.iumeatelier.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.iumeatelier.common.PageResult;
import com.iumeatelier.dto.response.AdminAuditLogResponse;
import com.iumeatelier.entity.AdminAuditLog;
import com.iumeatelier.mapper.AdminAuditLogMapper;
import com.iumeatelier.security.SecurityUser;
import com.iumeatelier.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminAuditLogService {

    private final AdminAuditLogMapper auditLogMapper;

    public void log(String action, String resourceType, Long resourceId, String detail) {
        SecurityUser admin = SecurityUtils.getCurrentUser();
        if (admin == null) {
            return;
        }
        AdminAuditLog entry = new AdminAuditLog();
        entry.setAdminId(admin.getId());
        entry.setAdminUsername(admin.getUsername());
        entry.setAction(action);
        entry.setResourceType(resourceType);
        entry.setResourceId(resourceId);
        entry.setDetail(detail);
        auditLogMapper.insert(entry);
    }

    public PageResult<AdminAuditLogResponse> list(int page, int size) {
        SecurityUtils.requireAdmin();
        Page<AdminAuditLog> pageParam = new Page<>(page, size);
        Page<AdminAuditLog> result = auditLogMapper.selectPage(pageParam,
                new LambdaQueryWrapper<AdminAuditLog>().orderByDesc(AdminAuditLog::getCreatedAt));
        List<AdminAuditLogResponse> records = result.getRecords().stream().map(this::toResponse).toList();
        return PageResult.of(result.getCurrent(), result.getSize(), result.getTotal(), records);
    }

    private AdminAuditLogResponse toResponse(AdminAuditLog log) {
        return AdminAuditLogResponse.builder()
                .id(log.getId())
                .adminId(log.getAdminId())
                .adminUsername(log.getAdminUsername())
                .action(log.getAction())
                .resourceType(log.getResourceType())
                .resourceId(log.getResourceId())
                .detail(log.getDetail())
                .createdAt(log.getCreatedAt())
                .build();
    }
}
