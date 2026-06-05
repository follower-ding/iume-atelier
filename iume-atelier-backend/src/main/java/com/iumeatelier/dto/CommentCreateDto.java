package com.iumeatelier.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CommentCreateDto {

  @NotNull
  private Long articleId;

  @NotBlank
  private String content;
}
