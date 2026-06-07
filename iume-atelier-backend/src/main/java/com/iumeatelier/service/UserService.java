package com.iumeatelier.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.iumeatelier.dto.request.ChangePasswordRequest;
import com.iumeatelier.dto.request.CustomMusicTrackRequest;
import com.iumeatelier.dto.request.UpdateProfileRequest;
import com.iumeatelier.dto.request.UserPreferencesRequest;
import com.iumeatelier.dto.response.CustomMusicTrackResponse;
import com.iumeatelier.dto.response.UserPreferencesResponse;
import com.iumeatelier.dto.response.UserResponse;
import com.iumeatelier.entity.User;
import com.iumeatelier.exception.BusinessException;
import com.iumeatelier.mapper.UserMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;
    private final AuthService authService;
    private final ObjectMapper objectMapper;

    @Transactional
    public UserResponse updateProfile(Long userId, UpdateProfileRequest request) {
        User user = userMapper.selectById(userId);
        if (user == null) {
            throw new BusinessException(404, "User not found");
        }

        if (StringUtils.hasText(request.getEmail()) && !request.getEmail().equals(user.getEmail())) {
            if (userMapper.selectCount(new LambdaQueryWrapper<User>().eq(User::getEmail, request.getEmail())) > 0) {
                throw new BusinessException("Email already exists");
            }
            user.setEmail(request.getEmail().trim());
        }

        if (request.getNickname() != null) {
            user.setNickname(request.getNickname().trim());
        }

        if (request.getAvatar() != null) {
            user.setAvatar(StringUtils.hasText(request.getAvatar()) ? request.getAvatar().trim() : null);
        }

        userMapper.updateById(user);
        return authService.getCurrentUserProfile(userId);
    }

    public UserPreferencesResponse getPreferences(Long userId) {
        User user = requireUser(userId);
        return parsePreferences(user.getPreferences());
    }

    @Transactional
    public UserPreferencesResponse updatePreferences(Long userId, UserPreferencesRequest request) {
        User user = requireUser(userId);
        UserPreferencesResponse prefs = toPreferencesResponse(request);
        try {
            user.setPreferences(objectMapper.writeValueAsString(prefs));
        } catch (JsonProcessingException e) {
            throw new BusinessException("Failed to save preferences");
        }
        userMapper.updateById(user);
        return prefs;
    }

    @Transactional
    public void changePassword(Long userId, ChangePasswordRequest request) {
        User user = userMapper.selectById(userId);
        if (user == null) {
            throw new BusinessException(404, "User not found");
        }
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new BusinessException(401, "Current password is incorrect");
        }
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setMustChangePassword(false);
        userMapper.updateById(user);
    }

    private User requireUser(Long userId) {
        User user = userMapper.selectById(userId);
        if (user == null) {
            throw new BusinessException(404, "User not found");
        }
        return user;
    }

    private UserPreferencesResponse parsePreferences(String json) {
        if (!StringUtils.hasText(json)) {
            return UserPreferencesResponse.builder().companionCallName("").build();
        }
        try {
            return objectMapper.readValue(json, UserPreferencesResponse.class);
        } catch (JsonProcessingException e) {
            return UserPreferencesResponse.builder().companionCallName("").build();
        }
    }

    private UserPreferencesResponse toPreferencesResponse(UserPreferencesRequest request) {
        String callName = request.getCompanionCallName() != null ? request.getCompanionCallName().trim() : "";
        var quotes = request.getCustomQuotes() == null ? java.util.List.<String>of() :
                request.getCustomQuotes().stream().map(String::trim).filter(StringUtils::hasText).limit(8).toList();
        var tracks = request.getCustomTracks() == null ? java.util.List.<CustomMusicTrackResponse>of() :
                request.getCustomTracks().stream().map(this::toTrackResponse).limit(30).toList();
        return UserPreferencesResponse.builder()
                .companionCallName(callName)
                .customQuotes(quotes)
                .customTracks(tracks)
                .build();
    }

    private CustomMusicTrackResponse toTrackResponse(CustomMusicTrackRequest track) {
        return CustomMusicTrackResponse.builder()
                .id(track.getId())
                .title(track.getTitle().trim())
                .artist(track.getArtist() != null ? track.getArtist().trim() : "")
                .src(track.getSrc().trim())
                .createdAt(track.getCreatedAt())
                .build();
    }
}
