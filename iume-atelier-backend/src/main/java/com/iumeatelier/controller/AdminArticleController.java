package com.iumeatelier.controller;

import com.iumeatelier.common.result.Result;
import com.iumeatelier.dto.ArticleSaveDto;
import com.iumeatelier.service.ArticleService;
import com.iumeatelier.vo.ArticleVo;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/admin/articles")
@RequiredArgsConstructor
@Tag(name = "后台文章")
public class AdminArticleController {

  private final ArticleService articleService;

  @GetMapping
  @Operation(summary = "后台文章列表")
  public Result<List<ArticleVo>> list() {
    return Result.ok(articleService.listAdmin());
  }

  @PostMapping
  @Operation(summary = "创建文章")
  public Result<ArticleVo> create(HttpServletRequest request, @Valid @RequestBody ArticleSaveDto dto) {
    Long userId = (Long) request.getAttribute("userId");
    return Result.ok(articleService.create(userId, dto));
  }

  @PutMapping("/{id}")
  @Operation(summary = "更新文章")
  public Result<ArticleVo> update(@PathVariable Long id, @Valid @RequestBody ArticleSaveDto dto) {
    return Result.ok(articleService.update(id, dto));
  }

  @DeleteMapping("/{id}")
  @Operation(summary = "删除文章")
  public Result<Void> delete(@PathVariable Long id) {
    articleService.delete(id);
    return Result.ok("删除成功", null);
  }
}
