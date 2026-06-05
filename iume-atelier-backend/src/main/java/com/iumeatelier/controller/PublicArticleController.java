package com.iumeatelier.controller;

import com.iumeatelier.common.result.Result;
import com.iumeatelier.service.ArticleService;
import com.iumeatelier.vo.ArticleVo;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/public/articles")
@RequiredArgsConstructor
@Tag(name = "公开文章")
public class PublicArticleController {

  private final ArticleService articleService;

  @GetMapping
  @Operation(summary = "已发布文章列表")
  public Result<List<ArticleVo>> list(
      @RequestParam(defaultValue = "1") int page, @RequestParam(defaultValue = "10") int pageSize) {
    return Result.ok(articleService.listPublished(page, pageSize));
  }

  @GetMapping("/search")
  @Operation(summary = "搜索文章")
  public Result<List<ArticleVo>> search(@RequestParam String q) {
    return Result.ok(articleService.search(q));
  }

  @GetMapping("/{slug}")
  @Operation(summary = "文章详情")
  public Result<ArticleVo> detail(@PathVariable String slug) {
    return Result.ok(articleService.getBySlug(slug, true));
  }
}
