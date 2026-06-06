package com.iumeatelier.controller;

import com.iumeatelier.common.Result;
import com.iumeatelier.dto.request.ChangePasswordRequest;
import com.iumeatelier.dto.request.UpdateProfileRequest;
import com.iumeatelier.dto.request.UserPreferencesRequest;
import com.iumeatelier.dto.response.UserPreferencesResponse;
import com.iumeatelier.dto.response.UserResponse;
import com.iumeatelier.security.SecurityUtils;
import com.iumeatelier.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
@Tag(name = "Users", description = "User profile management")
public class UserController {

    private final UserService userService;

    @PutMapping("/me")
    @Operation(summary = "Update current user profile")
    public Result<UserResponse> updateProfile(@Valid @RequestBody UpdateProfileRequest request) {
        Long userId = SecurityUtils.getCurrentUserId();
        return Result.success(userService.updateProfile(userId, request));
    }

    @PutMapping("/me/password")
    @Operation(summary = "Change current user password")
    public Result<Void> changePassword(@Valid @RequestBody ChangePasswordRequest request) {
        Long userId = SecurityUtils.getCurrentUserId();
        userService.changePassword(userId, request);
        return Result.success();
    }

    @GetMapping("/me/preferences")
    @Operation(summary = "Get current user personalization preferences")
    public Result<UserPreferencesResponse> getPreferences() {
        Long userId = SecurityUtils.getCurrentUserId();
        return Result.success(userService.getPreferences(userId));
    }

    @PutMapping("/me/preferences")
    @Operation(summary = "Update current user personalization preferences")
    public Result<UserPreferencesResponse> updatePreferences(@Valid @RequestBody UserPreferencesRequest request) {
        Long userId = SecurityUtils.getCurrentUserId();
        return Result.success(userService.updatePreferences(userId, request));
    }
}
