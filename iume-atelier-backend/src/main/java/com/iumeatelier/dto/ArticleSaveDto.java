package com.iumeatelier.dto;

import jakarta.validation.constraints.NotBlank;
import java.util.List;
import lombok.Data;

@Data
public class ArticleSaveDto {

  @NotBlank
  private String title;

  private String slug;
  private String summary;

  @NotBlank
  private String contentMd;

  private String coverUrl;
  private String status;
  private List<String> tagNames;
}
