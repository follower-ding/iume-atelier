package com.iumeatelier.enums;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "User role")
public enum UserRole {
    USER,
    AUTHOR,
    ADMIN
}
