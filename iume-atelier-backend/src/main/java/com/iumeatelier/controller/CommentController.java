package com.iumeatelier.controller;

import com.iumeatelier.common.result.Result;
import com.iumeatelier.dto.CommentCreateDto;
import com.iumeatelier.entity.BlogComment;
import com.iumeatelier.service.CommentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/comments")
@RequiredArgsConstructor
@Tag(name = "评论")
public class CommentController {

  private final CommentService commentService;

  @GetMapping
  @Operation(summary = "文章评论列表")
  public Result<List<BlogComment>> list(@RequestParam Long articleId) {
    return Result.ok(commentService.listByArticle(articleId));
  }

  @PostMapping
  @Operation(summary = "发表评论")
  public Result<Void> create(HttpServletRequest request, @Valid @RequestBody CommentCreateDto dto) {
    Long userId = (Long) request.getAttribute("userId");
    String nickname = (String) request.getAttribute("username");
    commentService.create(userId, nickname, dto);
    return Result.ok("评论成功", null);
  }
}
