package com.iumeatelier.entity;

import java.time.LocalDateTime;
import lombok.Data;

@Data
public class SysUser {

  private Long id;
  private String username;
  private String passwordHash;
  private String nickname;
  private String email;
  private String roleCode;
  private LocalDateTime createTime;
  private LocalDateTime updateTime;
  private Integer isDeleted;
}
