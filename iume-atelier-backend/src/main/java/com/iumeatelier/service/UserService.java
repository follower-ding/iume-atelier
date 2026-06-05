package com.iumeatelier.service;

import com.iumeatelier.dto.LoginRequestDto;
import com.iumeatelier.dto.RegisterRequestDto;
import com.iumeatelier.vo.LoginResponseVo;

public interface UserService {

  void register(RegisterRequestDto dto);

  LoginResponseVo login(LoginRequestDto dto);
}
