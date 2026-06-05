package com.iumeatelier.entity;

import java.time.LocalDateTime;
import lombok.Data;

@Data
public class BlogArticle {

  private Long id;
  private String title;
  private String slug;
  private String summary;
  private String contentMd;
  private String contentHtml;
  private String coverUrl;
  private String status;
  private Long authorId;
  private Integer viewCount;
  private LocalDateTime publishedAt;
  private LocalDateTime createTime;
  private LocalDateTime updateTime;
  private Integer isDeleted;
}
