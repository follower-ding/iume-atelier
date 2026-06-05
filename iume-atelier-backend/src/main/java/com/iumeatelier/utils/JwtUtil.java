package com.iumeatelier.utils;

import com.iumeatelier.config.props.JwtSecurityProperties;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.List;
import javax.crypto.SecretKey;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class JwtUtil {

  private final JwtSecurityProperties properties;

  private SecretKey key() {
    return Keys.hmacShaKeyFor(properties.getSecret().getBytes(StandardCharsets.UTF_8));
  }

  public String createToken(Long userId, String username, List<String> roleCodes) {
    long now = System.currentTimeMillis();
    long exp = now + properties.getExpireHours() * 3600_000L;
    return Jwts.builder()
        .subject(String.valueOf(userId))
        .claim("username", username)
        .claim("roles", String.join(",", roleCodes))
        .issuedAt(new Date(now))
        .expiration(new Date(exp))
        .signWith(key())
        .compact();
  }

  public Claims parse(String token) {
    return Jwts.parser().verifyWith(key()).build().parseSignedClaims(token).getPayload();
  }
}
