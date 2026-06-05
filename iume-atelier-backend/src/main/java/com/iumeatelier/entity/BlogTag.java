package com.iumeatelier.entity;

import java.time.LocalDateTime;
import lombok.Data;

@Data
public class BlogTag {

  private Long id;
  private String name;
  private String slug;
  private LocalDateTime createTime;
  private LocalDateTime updateTime;
  private Integer isDeleted;
}
