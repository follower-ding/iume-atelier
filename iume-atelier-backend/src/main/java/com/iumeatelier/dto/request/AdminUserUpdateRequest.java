package com.iumeatelier.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
@Schema(description = "Admin update user request")
public class AdminUserUpdateRequest {

    @Size(max = 50)
    private String nickname;

    @Email
    @Size(max = 100)
    private String email;

    @Schema(description = "USER or ADMIN")
    private String role;
}
