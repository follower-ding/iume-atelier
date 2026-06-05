package com.iumeatelier.enums;

import com.baomidou.mybatisplus.annotation.EnumValue;
import com.fasterxml.jackson.annotation.JsonValue;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
@Schema(description = "Article publication status")
public enum ArticleStatus {
    DRAFT("DRAFT"),
    PUBLISHED("PUBLISHED");

    @EnumValue
    @JsonValue
    private final String value;
}
