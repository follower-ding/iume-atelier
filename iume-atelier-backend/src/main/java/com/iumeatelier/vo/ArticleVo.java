package com.iumeatelier.vo;

import java.time.LocalDateTime;
import java.util.List;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ArticleVo {

  private Long id;
  private String title;
  private String slug;
  private String summary;
  private String contentMd;
  private String contentHtml;
  private String coverUrl;
  private String status;
  private String authorName;
  private Integer viewCount;
  private LocalDateTime publishedAt;
  private List<String> tags;
}
