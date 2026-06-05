package com.iumeatelier.interceptor;

import com.iumeatelier.utils.JwtUtil;
import io.jsonwebtoken.Claims;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.util.Arrays;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
@RequiredArgsConstructor
public class JwtInterceptor implements HandlerInterceptor {

  private final JwtUtil jwtUtil;

  @Override
  public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
    if (!(handler instanceof HandlerMethod)) {
      return true;
    }
    String auth = request.getHeader("Authorization");
    if (!StringUtils.hasText(auth) || !auth.startsWith("Bearer ")) {
      response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
      return false;
    }
    try {
      Claims claims = jwtUtil.parse(auth.substring(7));
      request.setAttribute("userId", Long.parseLong(claims.getSubject()));
      request.setAttribute("username", claims.get("username", String.class));
      String roles = claims.get("roles", String.class);
      request.setAttribute(
          "roles",
          StringUtils.hasText(roles)
              ? Arrays.stream(roles.split(",")).map(String::trim).filter(StringUtils::hasText).toList()
              : List.of());
      return true;
    } catch (Exception ex) {
      response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
      return false;
    }
  }
}
