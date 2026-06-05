package com.iumeatelier.service;

import com.iumeatelier.dto.ArticleSaveDto;
import com.iumeatelier.vo.ArticleVo;
import java.util.List;

public interface ArticleService {

  List<ArticleVo> listPublished(int page, int pageSize);

  List<ArticleVo> search(String q);

  ArticleVo getBySlug(String slug, boolean incrementView);

  List<ArticleVo> listAdmin();

  ArticleVo create(Long userId, ArticleSaveDto dto);

  ArticleVo update(Long id, ArticleSaveDto dto);

  void delete(Long id);

  String buildRss();
}
