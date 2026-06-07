package com.iumeatelier.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.iumeatelier.dto.request.SharedMusicTrackRequest;
import com.iumeatelier.dto.response.SharedMusicTrackResponse;
import com.iumeatelier.entity.MediaAsset;
import com.iumeatelier.entity.SharedMusicTrack;
import com.iumeatelier.exception.BusinessException;
import com.iumeatelier.mapper.MediaAssetMapper;
import com.iumeatelier.mapper.SharedMusicTrackMapper;
import com.iumeatelier.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SharedMusicService {

    private final SharedMusicTrackMapper sharedMusicTrackMapper;
    private final MediaAssetMapper mediaAssetMapper;

    public List<SharedMusicTrackResponse> listPublic() {
        return sharedMusicTrackMapper.selectList(
                new LambdaQueryWrapper<SharedMusicTrack>()
                        .orderByAsc(SharedMusicTrack::getSortOrder)
                        .orderByDesc(SharedMusicTrack::getCreatedAt)
        ).stream().map(this::toResponse).toList();
    }

    @Transactional
    public SharedMusicTrackResponse create(SharedMusicTrackRequest request) {
        SecurityUtils.requireLogin();
        String src = request.getSrc().trim();
        long existing = sharedMusicTrackMapper.selectCount(
                new LambdaQueryWrapper<SharedMusicTrack>().eq(SharedMusicTrack::getSrc, src)
        );
        if (existing > 0) {
            throw new BusinessException("This audio is already in the community playlist");
        }

        SharedMusicTrack track = fromRequest(new SharedMusicTrack(), request);
        track.setUploaderId(SecurityUtils.getCurrentUserId());
        sharedMusicTrackMapper.insert(track);
        return toResponse(track);
    }

    @Transactional
    public SharedMusicTrackResponse update(Long id, SharedMusicTrackRequest request) {
        SecurityUtils.requireLogin();
        SharedMusicTrack track = requireTrack(id);
        requireOwnerOrAdmin(track);
        fromRequest(track, request);
        sharedMusicTrackMapper.updateById(track);
        return toResponse(track);
    }

    @Transactional
    public void delete(Long id) {
        SecurityUtils.requireLogin();
        SharedMusicTrack track = requireTrack(id);
        requireOwnerOrAdmin(track);
        sharedMusicTrackMapper.deleteById(id);
    }

    @Transactional
    public SharedMusicTrackResponse createFromMedia(Long mediaId) {
        SecurityUtils.requireAdmin();
        MediaAsset asset = mediaAssetMapper.selectById(mediaId);
        if (asset == null) {
            throw new BusinessException(404, "Media asset not found");
        }
        if (asset.getContentType() == null || !asset.getContentType().startsWith("audio/")) {
            throw new BusinessException("Only audio files can be added to shared music");
        }
        String src = asset.getPublicUrl();
        if (!StringUtils.hasText(src)) {
            throw new BusinessException("Media asset has no public URL");
        }
        long existing = sharedMusicTrackMapper.selectCount(
                new LambdaQueryWrapper<SharedMusicTrack>().eq(SharedMusicTrack::getSrc, src.trim())
        );
        if (existing > 0) {
            throw new BusinessException("This audio is already in the community playlist");
        }

        String rawName = StringUtils.hasText(asset.getOriginalName())
                ? asset.getOriginalName()
                : asset.getStoredName();
        String title = stripExtension(rawName);

        SharedMusicTrack track = new SharedMusicTrack();
        track.setTitle(title);
        track.setArtist("iume ambient");
        track.setSrc(src.trim());
        track.setSortOrder(0);
        track.setUploaderId(SecurityUtils.getCurrentUserId());
        sharedMusicTrackMapper.insert(track);
        return toResponse(track);
    }

    private void requireOwnerOrAdmin(SharedMusicTrack track) {
        if (SecurityUtils.isAdmin()) {
            return;
        }
        Long userId = SecurityUtils.getCurrentUserId();
        if (userId == null || track.getUploaderId() == null || !userId.equals(track.getUploaderId())) {
            throw new BusinessException(403, "Not allowed to modify this track");
        }
    }

    private String stripExtension(String name) {
        if (!StringUtils.hasText(name)) {
            return "Untitled";
        }
        return name.replaceAll("\\.[^.]+$", "");
    }

    private SharedMusicTrack requireTrack(Long id) {
        SharedMusicTrack track = sharedMusicTrackMapper.selectById(id);
        if (track == null) {
            throw new BusinessException(404, "Shared track not found");
        }
        return track;
    }

    private SharedMusicTrack fromRequest(SharedMusicTrack track, SharedMusicTrackRequest request) {
        track.setTitle(request.getTitle().trim());
        track.setArtist(request.getArtist() != null ? request.getArtist().trim() : "");
        track.setSrc(request.getSrc().trim());
        track.setCover(StringUtils.hasText(request.getCover()) ? request.getCover().trim() : null);
        track.setSortOrder(request.getSortOrder() != null ? request.getSortOrder() : 0);
        return track;
    }

    private SharedMusicTrackResponse toResponse(SharedMusicTrack track) {
        return SharedMusicTrackResponse.builder()
                .id(track.getId())
                .title(track.getTitle())
                .artist(track.getArtist())
                .src(track.getSrc())
                .cover(track.getCover())
                .sortOrder(track.getSortOrder())
                .createdAt(track.getCreatedAt())
                .uploaderId(track.getUploaderId())
                .build();
    }
}
