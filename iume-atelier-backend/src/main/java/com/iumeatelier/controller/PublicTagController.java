package com.iumeatelier.controller;

import com.iumeatelier.common.result.Result;
import com.iumeatelier.entity.BlogTag;
import com.iumeatelier.mapper.TagMapper;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/public/tags")
@RequiredArgsConstructor
@Tag(name = "公开标签")
public class PublicTagController {

  private final TagMapper tagMapper;

  @GetMapping
  @Operation(summary = "标签列表")
  public Result<List<BlogTag>> list() {
    return Result.ok(tagMapper.listAll());
  }
}
