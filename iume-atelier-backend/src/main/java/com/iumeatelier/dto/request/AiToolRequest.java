package com.iumeatelier.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Data
public class AiToolRequest {

    @NotBlank
    @Pattern(regexp = "^[a-z0-9]+(-[a-z0-9]+)*$", message = "slug must be lowercase with hyphens")
    @Size(max = 100)
    private String slug;

    @NotBlank
    @Size(max = 120)
    private String name;

    @NotBlank
    @Size(max = 500)
    private String description;

    @NotBlank
    @Pattern(regexp = "^(mcp|skill|prompt|online)$")
    private String category;

    @NotBlank
    @Size(max = 20)
    private String icon;

    private List<String> tags = new ArrayList<>();

    @Size(max = 500)
    private String url;

    private Boolean featured = false;

    @Pattern(regexp = "^(official|custom)$")
    private String source = "official";

    @NotNull
    @Valid
    private AiToolDetailRequest detail;

    private Integer sortOrder = 0;
}
