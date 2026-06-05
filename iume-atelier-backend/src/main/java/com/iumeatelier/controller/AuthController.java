package com.iumeatelier.controller;

import com.iumeatelier.common.result.Result;
import com.iumeatelier.dto.LoginRequestDto;
import com.iumeatelier.dto.RegisterRequestDto;
import com.iumeatelier.service.UserService;
import com.iumeatelier.vo.LoginResponseVo;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@Tag(name = "鉴权模块")
public class AuthController {

  private final UserService userService;

  @PostMapping("/register")
  @Operation(summary = "用户注册")
  public Result<Void> register(@Valid @RequestBody RegisterRequestDto dto) {
    userService.register(dto);
    return Result.ok("注册成功", null);
  }

  @PostMapping("/login")
  @Operation(summary = "用户登录")
  public Result<LoginResponseVo> login(@Valid @RequestBody LoginRequestDto dto) {
    return Result.ok(userService.login(dto));
  }
}
