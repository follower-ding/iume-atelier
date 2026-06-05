package com.iumeatelier.controller;

import com.iumeatelier.service.RssService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@Tag(name = "RSS", description = "RSS feed")
public class RssController {

    private final RssService rssService;

    @GetMapping(value = "/rss", produces = MediaType.APPLICATION_RSS_XML_VALUE)
    @Operation(summary = "RSS feed of published articles")
    public String rss() {
        return rssService.generateRssFeed();
    }
}
