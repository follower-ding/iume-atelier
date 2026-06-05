package com.iumeatelier.service.impl;

import com.iumeatelier.common.exception.BizException;
import com.iumeatelier.dto.LoginRequestDto;
import com.iumeatelier.dto.RegisterRequestDto;
import com.iumeatelier.entity.SysUser;
import com.iumeatelier.mapper.UserMapper;
import com.iumeatelier.service.UserService;
import com.iumeatelier.utils.JwtUtil;
import com.iumeatelier.vo.LoginResponseVo;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

  private final UserMapper userMapper;
  private final JwtUtil jwtUtil;
  private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

  @Override
  public void register(RegisterRequestDto dto) {
    if (userMapper.findByUsername(dto.getUsername()) != null) {
      throw new BizException(400, "用户名已存在");
    }
    SysUser user = new SysUser();
    user.setUsername(dto.getUsername());
    user.setPasswordHash(passwordEncoder.encode(dto.getPassword()));
    user.setNickname(dto.getNickname() != null ? dto.getNickname() : dto.getUsername());
    user.setEmail(dto.getEmail());
    user.setRoleCode("AUTHOR");
    userMapper.insert(user);
  }

  @Override
  public LoginResponseVo login(LoginRequestDto dto) {
    SysUser user = userMapper.findByUsername(dto.getUsername());
    if (user == null || !passwordEncoder.matches(dto.getPassword(), user.getPasswordHash())) {
      throw new BizException(401, "用户名或密码错误");
    }
    List<String> roles = List.of(user.getRoleCode());
    String token = jwtUtil.createToken(user.getId(), user.getUsername(), roles);
    return LoginResponseVo.builder()
        .token(token)
        .userId(user.getId())
        .username(user.getUsername())
        .nickname(user.getNickname())
        .roles(roles)
        .build();
  }
}
