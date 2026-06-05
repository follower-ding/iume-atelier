package com.iumeatelier.controller;

import com.iumeatelier.dto.response.HealthResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@Tag(name = "Health", description = "Service health check")
public class HealthController {

    @Value("${iume.app.version:1.0.0}")
    private String version;

    @GetMapping("/health")
    @Operation(summary = "Health check endpoint")
    public HealthResponse health() {
        return new HealthResponse("UP", version);
    }
}
