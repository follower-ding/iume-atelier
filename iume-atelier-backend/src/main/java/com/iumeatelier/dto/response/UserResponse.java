package com.iumeatelier.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "User profile response")
public class UserResponse {

    @Schema(description = "User ID", example = "1")
    private Long id;

    @Schema(description = "Username", example = "admin")
    private String username;

    @Schema(description = "Email", example = "admin@iumeatelier.com")
    private String email;

    @Schema(description = "Nickname", example = "Admin")
    private String nickname;

    @Schema(description = "Avatar URL")
    private String avatar;

    @Schema(description = "User role", example = "ADMIN")
    private String role;

    @Schema(description = "Whether user must change password on next login")
    private Boolean mustChangePassword;

    @Schema(description = "Created at")
    private LocalDateTime createdAt;
}
