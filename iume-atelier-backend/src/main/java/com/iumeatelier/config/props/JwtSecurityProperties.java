package com.iumeatelier.config.props;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;

@Data
@ConfigurationProperties(prefix = "security.jwt")
public class JwtSecurityProperties {

  private String secret;
  private int expireHours = 24;
}
