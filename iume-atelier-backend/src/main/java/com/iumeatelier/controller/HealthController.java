package com.iumeatelier.controller;

import com.iumeatelier.common.result.Result;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.Map;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/health")
@Tag(name = "健康检查")
public class HealthController {

  @Value("${app.version:1.0.0}")
  private String version;

  @GetMapping
  @Operation(summary = "服务健康状态")
  public Result<Map<String, String>> health() {
    return Result.ok(Map.of("status", "UP", "version", version));
  }
}
