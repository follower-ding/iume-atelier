package com.iumeatelier.controller;

import com.iumeatelier.service.RobotsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@Tag(name = "Robots", description = "robots.txt for crawlers")
public class RobotsController {

    private final RobotsService robotsService;

    @GetMapping(value = "/robots.txt", produces = MediaType.TEXT_PLAIN_VALUE)
    @Operation(summary = "robots.txt")
    public String robots() {
        return robotsService.generate();
    }
}
