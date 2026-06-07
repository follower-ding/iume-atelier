package com.iumeatelier.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.iumeatelier.common.PageResult;
import com.iumeatelier.dto.response.MediaAssetResponse;
import com.iumeatelier.entity.MediaAsset;
import com.iumeatelier.exception.BusinessException;
import com.iumeatelier.mapper.MediaAssetMapper;
import com.iumeatelier.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class MediaAssetService {

    private final MediaAssetMapper mediaAssetMapper;

    public MediaAssetResponse recordUpload(
            String storedName,
            String originalName,
            String contentType,
            long sizeBytes,
            String publicUrl,
            Long uploaderId
    ) {
        MediaAsset asset = new MediaAsset();
        asset.setStoredName(storedName);
        asset.setOriginalName(originalName);
        asset.setContentType(contentType);
        asset.setSizeBytes(sizeBytes);
        asset.setPublicUrl(publicUrl);
        asset.setUploaderId(uploaderId);
        mediaAssetMapper.insert(asset);
        return toResponse(asset);
    }

    public PageResult<MediaAssetResponse> list(int page, int size) {
        SecurityUtils.requireAdmin();
        Page<MediaAsset> pageParam = new Page<>(page, size);
        Page<MediaAsset> result = mediaAssetMapper.selectPage(
                pageParam,
                new LambdaQueryWrapper<MediaAsset>().orderByDesc(MediaAsset::getCreatedAt)
        );
        return PageResult.of(
                result.getCurrent(),
                result.getSize(),
                result.getTotal(),
                result.getRecords().stream().map(this::toResponse).toList()
        );
    }

    @Transactional
    public void delete(Long id) {
        SecurityUtils.requireAdmin();
        MediaAsset asset = mediaAssetMapper.selectById(id);
        if (asset == null) {
            throw new BusinessException(404, "Media not found");
        }
        mediaAssetMapper.deleteById(id);
    }

    private MediaAssetResponse toResponse(MediaAsset asset) {
        return MediaAssetResponse.builder()
                .id(asset.getId())
                .storedName(asset.getStoredName())
                .originalName(asset.getOriginalName())
                .contentType(asset.getContentType())
                .sizeBytes(asset.getSizeBytes())
                .publicUrl(asset.getPublicUrl())
                .uploaderId(asset.getUploaderId())
                .createdAt(asset.getCreatedAt())
                .build();
    }
}
