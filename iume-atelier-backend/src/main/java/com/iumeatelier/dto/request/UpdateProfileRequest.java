package com.iumeatelier.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
@Schema(description = "Update current user profile")
public class UpdateProfileRequest {

    @Size(max = 50, message = "Nickname must not exceed 50 characters")
    @Schema(description = "Display name", example = "iume")
    private String nickname;

    @Email(message = "Invalid email format")
    @Size(max = 100, message = "Email must not exceed 100 characters")
    @Schema(description = "Email address", example = "hello@example.com")
    private String email;

    @Size(max = 500, message = "Avatar URL must not exceed 500 characters")
    @Schema(description = "Avatar image URL")
    private String avatar;
}
