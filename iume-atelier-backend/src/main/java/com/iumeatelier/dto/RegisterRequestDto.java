package com.iumeatelier.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class RegisterRequestDto {

  @NotBlank
  @Size(min = 3, max = 32)
  private String username;

  @NotBlank
  @Size(min = 6, max = 64)
  private String password;

  private String nickname;
  private String email;
}
