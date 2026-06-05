package com.iumeatelier.entity;

import java.time.LocalDateTime;
import lombok.Data;

@Data
public class BlogComment {

  private Long id;
  private Long articleId;
  private Long userId;
  private String nickname;
  private String content;
  private String status;
  private LocalDateTime createTime;
  private LocalDateTime updateTime;
  private Integer isDeleted;
}
