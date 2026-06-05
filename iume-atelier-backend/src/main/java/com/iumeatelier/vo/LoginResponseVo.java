package com.iumeatelier.vo;

import java.util.List;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class LoginResponseVo {

  private String token;
  private Long userId;
  private String username;
  private String nickname;
  private List<String> roles;
}
