package com.iumeatelier.controller;

import com.iumeatelier.service.ArticleService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/rss")
@RequiredArgsConstructor
public class RssController {

  private final ArticleService articleService;

  @GetMapping(produces = MediaType.APPLICATION_XML_VALUE)
  public String rss() {
    return articleService.buildRss();
  }
}
