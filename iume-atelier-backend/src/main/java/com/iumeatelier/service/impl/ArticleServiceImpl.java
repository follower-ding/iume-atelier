package com.iumeatelier.service.impl;

import com.iumeatelier.common.exception.BizException;
import com.iumeatelier.dto.ArticleSaveDto;
import com.iumeatelier.entity.BlogArticle;
import com.iumeatelier.entity.BlogTag;
import com.iumeatelier.entity.SysUser;
import com.iumeatelier.mapper.ArticleMapper;
import com.iumeatelier.mapper.TagMapper;
import com.iumeatelier.mapper.UserMapper;
import com.iumeatelier.service.ArticleService;
import com.iumeatelier.utils.MarkdownUtil;
import com.iumeatelier.vo.ArticleVo;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
public class ArticleServiceImpl implements ArticleService {

  private final ArticleMapper articleMapper;
  private final TagMapper tagMapper;
  private final UserMapper userMapper;

  @Override
  public List<ArticleVo> listPublished(int page, int pageSize) {
    int offset = Math.max(page - 1, 0) * pageSize;
    return articleMapper.listPublished(offset, pageSize).stream().map(this::toVo).collect(Collectors.toList());
  }

  @Override
  public List<ArticleVo> search(String q) {
    if (!StringUtils.hasText(q)) {
      return List.of();
    }
    return articleMapper.search(q.trim()).stream().map(this::toVo).collect(Collectors.toList());
  }

  @Override
  public ArticleVo getBySlug(String slug, boolean incrementView) {
    BlogArticle article = articleMapper.findBySlug(slug);
    if (article == null || article.getIsDeleted() == 1) {
      throw new BizException(404, "文章不存在");
    }
    if (incrementView && "PUBLISHED".equals(article.getStatus())) {
      articleMapper.incrementView(article.getId());
      article.setViewCount(article.getViewCount() + 1);
    }
    return toVo(article);
  }

  @Override
  public List<ArticleVo> listAdmin() {
    return articleMapper.listAllAdmin().stream().map(this::toVo).collect(Collectors.toList());
  }

  @Override
  @Transactional
  public ArticleVo create(Long userId, ArticleSaveDto dto) {
    BlogArticle article = buildArticle(userId, dto, null);
    articleMapper.insert(article);
    saveTags(article.getId(), dto.getTagNames());
    return toVo(articleMapper.findById(article.getId()));
  }

  @Override
  @Transactional
  public ArticleVo update(Long id, ArticleSaveDto dto) {
    BlogArticle existing = articleMapper.findById(id);
    if (existing == null) {
      throw new BizException(404, "文章不存在");
    }
    BlogArticle article = buildArticle(existing.getAuthorId(), dto, existing);
    article.setId(id);
    articleMapper.update(article);
    articleMapper.clearTags(id);
    saveTags(id, dto.getTagNames());
    return toVo(articleMapper.findById(id));
  }

  @Override
  public void delete(Long id) {
    articleMapper.softDelete(id);
  }

  @Override
  public String buildRss() {
    List<ArticleVo> articles = listPublished(1, 20);
    StringBuilder sb = new StringBuilder();
    sb.append("<?xml version=\"1.0\" encoding=\"UTF-8\"?><rss version=\"2.0\"><channel>");
    sb.append("<title>iume-atelier</title><description>iume writing atelier</description>");
    for (ArticleVo a : articles) {
      sb.append("<item><title>").append(escapeXml(a.getTitle())).append("</title>");
      sb.append("<link>/articles/").append(a.getSlug()).append("</link>");
      sb.append("<description>").append(escapeXml(a.getSummary())).append("</description>");
      sb.append("</item>");
    }
    sb.append("</channel></rss>");
    return sb.toString();
  }

  private BlogArticle buildArticle(Long userId, ArticleSaveDto dto, BlogArticle existing) {
    BlogArticle article = existing != null ? existing : new BlogArticle();
    article.setTitle(dto.getTitle());
    article.setSlug(StringUtils.hasText(dto.getSlug()) ? dto.getSlug() : slugify(dto.getTitle()));
    article.setSummary(dto.getSummary());
    article.setContentMd(dto.getContentMd());
    article.setContentHtml(MarkdownUtil.toHtml(dto.getContentMd()));
    article.setCoverUrl(dto.getCoverUrl());
    String status = StringUtils.hasText(dto.getStatus()) ? dto.getStatus() : "DRAFT";
    article.setStatus(status);
    article.setAuthorId(userId);
    article.setViewCount(existing != null ? existing.getViewCount() : 0);
    if ("PUBLISHED".equals(status)) {
      article.setPublishedAt(existing != null && existing.getPublishedAt() != null
          ? existing.getPublishedAt() : LocalDateTime.now());
    }
    return article;
  }

  private void saveTags(Long articleId, List<String> tagNames) {
    if (tagNames == null) {
      return;
    }
    for (String name : tagNames) {
      if (!StringUtils.hasText(name)) {
        continue;
      }
      BlogTag tag = tagMapper.findByName(name.trim());
      if (tag == null) {
        tag = new BlogTag();
        tag.setName(name.trim());
        tag.setSlug(slugify(name.trim()));
        tagMapper.insert(tag);
      }
      tagMapper.linkArticle(articleId, tag.getId());
    }
  }

  private ArticleVo toVo(BlogArticle article) {
    SysUser author = userMapper.findById(article.getAuthorId());
    return ArticleVo.builder()
        .id(article.getId())
        .title(article.getTitle())
        .slug(article.getSlug())
        .summary(article.getSummary())
        .contentMd(article.getContentMd())
        .contentHtml(article.getContentHtml())
        .coverUrl(article.getCoverUrl())
        .status(article.getStatus())
        .authorName(author != null ? author.getNickname() : "unknown")
        .viewCount(article.getViewCount())
        .publishedAt(article.getPublishedAt())
        .tags(tagMapper.namesByArticle(article.getId()))
        .build();
  }

  private String slugify(String input) {
    return input.toLowerCase(Locale.ROOT).replaceAll("[^a-z0-9\\u4e00-\\u9fa5]+", "-").replaceAll("^-|-$", "");
  }

  private String escapeXml(String s) {
    if (s == null) {
      return "";
    }
    return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;");
  }
}
