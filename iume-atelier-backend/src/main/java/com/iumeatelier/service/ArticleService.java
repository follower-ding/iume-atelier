package com.iumeatelier.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.iumeatelier.common.PageResult;
import com.iumeatelier.dto.request.ArticleRequest;
import com.iumeatelier.dto.response.ArticleResponse;
import com.iumeatelier.dto.response.TagResponse;
import com.iumeatelier.entity.Article;
import com.iumeatelier.entity.ArticleTag;
import com.iumeatelier.entity.Category;
import com.iumeatelier.entity.Tag;
import com.iumeatelier.entity.User;
import com.iumeatelier.enums.ArticleStatus;
import com.iumeatelier.exception.BusinessException;
import com.iumeatelier.entity.Series;
import com.iumeatelier.mapper.ArticleMapper;
import com.iumeatelier.mapper.ArticleTagMapper;
import com.iumeatelier.mapper.CategoryMapper;
import com.iumeatelier.mapper.SeriesMapper;
import com.iumeatelier.mapper.TagMapper;
import com.iumeatelier.utils.SlugUtils;
import com.iumeatelier.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ArticleService {

    private final ArticleMapper articleMapper;
    private final ArticleTagMapper articleTagMapper;
    private final CategoryMapper categoryMapper;
    private final TagMapper tagMapper;
    private final SeriesMapper seriesMapper;
    private final AuthService authService;
    private final AnalyticsService analyticsService;

    public PageResult<ArticleResponse> listPublished(int page, int size, Long categoryId, Long tagId, String sort) {
        Page<Article> pageParam = new Page<>(page, size);
        LambdaQueryWrapper<Article> wrapper = new LambdaQueryWrapper<Article>()
                .eq(Article::getStatus, ArticleStatus.PUBLISHED)
                .eq(categoryId != null, Article::getCategoryId, categoryId);

        if (tagId != null) {
            List<Long> articleIds = articleTagMapper.selectList(
                            new LambdaQueryWrapper<ArticleTag>().eq(ArticleTag::getTagId, tagId))
                    .stream()
                    .map(ArticleTag::getArticleId)
                    .distinct()
                    .toList();
            if (articleIds.isEmpty()) {
                return PageResult.of(page, size, 0, Collections.emptyList());
            }
            wrapper.in(Article::getId, articleIds);
        }

        if ("popular".equalsIgnoreCase(sort)) {
            wrapper.orderByDesc(Article::getViewCount).orderByDesc(Article::getPublishedAt);
        } else {
            wrapper.orderByDesc(Article::getPublishedAt);
        }

        Page<Article> result = articleMapper.selectPage(pageParam, wrapper);
        return toPageResult(result);
    }

    public PageResult<ArticleResponse> listAll(int page, int size, ArticleStatus status, Long authorId) {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        if (currentUserId == null) {
            throw new BusinessException(401, "Authentication required");
        }

        Page<Article> pageParam = new Page<>(page, size);
        LambdaQueryWrapper<Article> wrapper = new LambdaQueryWrapper<Article>()
                .eq(status != null, Article::getStatus, status)
                .orderByDesc(Article::getUpdatedAt);

        if (!SecurityUtils.isAdmin()) {
            wrapper.eq(Article::getAuthorId, currentUserId);
        } else if (authorId != null) {
            wrapper.eq(Article::getAuthorId, authorId);
        }

        Page<Article> result = articleMapper.selectPage(pageParam, wrapper);
        return toPageResult(result);
    }

    public PageResult<ArticleResponse> search(String keyword, int page, int size) {
        if (!StringUtils.hasText(keyword)) {
            throw new BusinessException("Keyword is required");
        }
        Page<Article> pageParam = new Page<>(page, size);
        String trimmed = keyword.trim();
        var result = articleMapper.searchPublishedFulltext(pageParam, trimmed);
        if (result.getTotal() == 0) {
            result = articleMapper.searchPublished(pageParam, trimmed);
        }
        return toPageResult(result);
    }

    public ArticleResponse getById(Long id, boolean incrementView) {
        Article article = articleMapper.selectById(id);
        if (article == null) {
            throw new BusinessException(404, "Article not found");
        }
        if (article.getStatus() != ArticleStatus.PUBLISHED && !canManage(article)) {
            throw new BusinessException(404, "Article not found");
        }
        if (incrementView && article.getStatus() == ArticleStatus.PUBLISHED) {
            articleMapper.incrementViewCount(id);
            article.setViewCount(article.getViewCount() + 1);
            analyticsService.record("/article/" + article.getSlug(), id, null, null);
        }
        return toResponse(article);
    }

    public ArticleResponse getBySlug(String slug, boolean incrementView) {
        Article article = articleMapper.selectOne(new LambdaQueryWrapper<Article>().eq(Article::getSlug, slug));
        if (article == null) {
            throw new BusinessException(404, "Article not found");
        }
        return getById(article.getId(), incrementView);
    }

    @Transactional
    public ArticleResponse create(ArticleRequest request, Long authorId) {
        normalizeRequest(request);
        String slug = resolveSlug(request.getSlug(), request.getTitle(), null);
        request.setSlug(slug);
        Article article = buildArticleFromRequest(new Article(), request, authorId);
        if (article.getStatus() == ArticleStatus.PUBLISHED) {
            article.setPublishedAt(LocalDateTime.now());
        }
        articleMapper.insert(article);
        saveTags(article.getId(), request.getTagIds());
        return toResponse(article);
    }

    @Transactional
    public ArticleResponse update(Long id, ArticleRequest request) {
        Article article = getArticleOrThrow(id);
        if (!canManage(article)) {
            throw new BusinessException(403, "Not authorized to update this article");
        }
        normalizeRequest(request);
        String slug = resolveSlug(request.getSlug(), request.getTitle(), id);
        request.setSlug(slug);
        ArticleStatus oldStatus = article.getStatus();
        buildArticleFromRequest(article, request, article.getAuthorId());
        if (oldStatus != ArticleStatus.PUBLISHED && article.getStatus() == ArticleStatus.PUBLISHED) {
            article.setPublishedAt(LocalDateTime.now());
        }
        articleMapper.updateById(article);
        articleTagMapper.delete(new LambdaQueryWrapper<ArticleTag>().eq(ArticleTag::getArticleId, id));
        saveTags(id, request.getTagIds());
        return toResponse(article);
    }

    @Transactional
    public void delete(Long id) {
        Article article = getArticleOrThrow(id);
        if (!canManage(article)) {
            throw new BusinessException(403, "Not authorized to delete this article");
        }
        articleTagMapper.delete(new LambdaQueryWrapper<ArticleTag>().eq(ArticleTag::getArticleId, id));
        articleMapper.deleteById(id);
    }

    public List<Article> listPublishedForFeed() {
        return articleMapper.selectList(new LambdaQueryWrapper<Article>()
                .eq(Article::getStatus, ArticleStatus.PUBLISHED)
                .orderByDesc(Article::getPublishedAt)
                .last("LIMIT 50"));
    }

    private Article getArticleOrThrow(Long id) {
        Article article = articleMapper.selectById(id);
        if (article == null) {
            throw new BusinessException(404, "Article not found");
        }
        return article;
    }

    private boolean canManage(Article article) {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        if (currentUserId == null) {
            return false;
        }
        return SecurityUtils.isAdmin() || article.getAuthorId().equals(currentUserId);
    }

    private String resolveSlug(String requestedSlug, String title, Long excludeId) {
        String base = StringUtils.hasText(requestedSlug) ? requestedSlug.trim() : SlugUtils.fromTitle(title);
        String slug = base;
        int counter = 1;
        while (isSlugTaken(slug, excludeId)) {
            slug = base + "-" + counter++;
        }
        return slug;
    }

    private boolean isSlugTaken(String slug, Long excludeId) {
        LambdaQueryWrapper<Article> wrapper = new LambdaQueryWrapper<Article>().eq(Article::getSlug, slug);
        if (excludeId != null) {
            wrapper.ne(Article::getId, excludeId);
        }
        return articleMapper.selectCount(wrapper) > 0;
    }

    private void normalizeRequest(ArticleRequest request) {
        if (!StringUtils.hasText(request.getSummary()) && StringUtils.hasText(request.getContent())) {
            request.setSummary(extractSummary(request.getContent()));
        }
    }

    private String extractSummary(String content) {
        String text = content
                .replaceAll("```[\\s\\S]*?```", "")
                .replaceAll("[#>*\\[\\]()!`]", "")
                .trim();
        for (String line : text.split("\n")) {
            String trimmed = line.trim();
            if (StringUtils.hasText(trimmed)) {
                return trimmed.length() > 500 ? trimmed.substring(0, 500) : trimmed;
            }
        }
        return "";
    }

    private Article buildArticleFromRequest(Article article, ArticleRequest request, Long authorId) {
        article.setTitle(request.getTitle());
        article.setSlug(request.getSlug());
        article.setContent(request.getContent());
        article.setSummary(request.getSummary());
        article.setCoverImage(request.getCoverImage());
        article.setStatus(request.getStatus() != null ? request.getStatus() : ArticleStatus.DRAFT);
        article.setAuthorId(authorId);
        article.setCategoryId(request.getCategoryId());
        article.setSeriesId(request.getSeriesId());
        article.setSeriesOrder(request.getSeriesOrder() != null ? request.getSeriesOrder() : 0);
        if (article.getViewCount() == null) {
            article.setViewCount(0);
        }
        return article;
    }

    private void saveTags(Long articleId, List<Long> tagIds) {
        if (tagIds == null || tagIds.isEmpty()) {
            return;
        }
        for (Long tagId : tagIds) {
            ArticleTag articleTag = new ArticleTag();
            articleTag.setArticleId(articleId);
            articleTag.setTagId(tagId);
            articleTagMapper.insert(articleTag);
        }
    }

    private PageResult<ArticleResponse> toPageResult(Page<Article> page) {
        List<ArticleResponse> records = page.getRecords().stream().map(this::toResponse).toList();
        return PageResult.of(page.getCurrent(), page.getSize(), page.getTotal(), records);
    }

    private PageResult<ArticleResponse> toPageResult(com.baomidou.mybatisplus.core.metadata.IPage<Article> page) {
        List<ArticleResponse> records = page.getRecords().stream().map(this::toResponse).toList();
        return PageResult.of(page.getCurrent(), page.getSize(), page.getTotal(), records);
    }

    private ArticleResponse toResponse(Article article) {
        User author = authService.findById(article.getAuthorId());
        Category category = article.getCategoryId() != null ? categoryMapper.selectById(article.getCategoryId()) : null;
        Series series = article.getSeriesId() != null ? seriesMapper.selectById(article.getSeriesId()) : null;
        List<TagResponse> tags = loadTags(article.getId());

        return ArticleResponse.builder()
                .id(article.getId())
                .title(article.getTitle())
                .slug(article.getSlug())
                .content(article.getContent())
                .summary(article.getSummary())
                .coverImage(article.getCoverImage())
                .status(article.getStatus())
                .authorId(article.getAuthorId())
                .authorName(author != null ? author.getNickname() : null)
                .categoryId(article.getCategoryId())
                .categoryName(category != null ? category.getName() : null)
                .seriesId(article.getSeriesId())
                .seriesTitle(series != null ? series.getTitle() : null)
                .seriesSlug(series != null ? series.getSlug() : null)
                .seriesOrder(article.getSeriesOrder())
                .viewCount(article.getViewCount())
                .tags(tags)
                .createdAt(article.getCreatedAt())
                .updatedAt(article.getUpdatedAt())
                .publishedAt(article.getPublishedAt())
                .build();
    }

    private List<TagResponse> loadTags(Long articleId) {
        List<ArticleTag> articleTags = articleTagMapper.selectList(
                new LambdaQueryWrapper<ArticleTag>().eq(ArticleTag::getArticleId, articleId));
        if (articleTags.isEmpty()) {
            return Collections.emptyList();
        }
        List<Long> tagIds = articleTags.stream().map(ArticleTag::getTagId).toList();
        Map<Long, Tag> tagMap = tagMapper.selectBatchIds(tagIds).stream()
                .collect(Collectors.toMap(Tag::getId, t -> t));
        return tagIds.stream()
                .map(tagMap::get)
                .filter(t -> t != null)
                .map(t -> TagResponse.builder()
                        .id(t.getId())
                        .name(t.getName())
                        .slug(t.getSlug())
                        .createdAt(t.getCreatedAt())
                        .build())
                .toList();
    }
}
