package com.iumeatelier.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.iumeatelier.common.PageResult;
import com.iumeatelier.dto.request.SeriesRequest;
import com.iumeatelier.dto.response.ArticleResponse;
import com.iumeatelier.dto.response.SeriesResponse;
import com.iumeatelier.entity.Article;
import com.iumeatelier.entity.Category;
import com.iumeatelier.entity.Series;
import com.iumeatelier.entity.User;
import com.iumeatelier.mapper.CategoryMapper;
import com.iumeatelier.mapper.UserMapper;
import com.iumeatelier.enums.ArticleStatus;
import com.iumeatelier.exception.BusinessException;
import com.iumeatelier.mapper.ArticleMapper;
import com.iumeatelier.mapper.SeriesMapper;
import com.iumeatelier.security.SecurityUtils;
import com.iumeatelier.utils.SlugUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.Collections;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SeriesService {

    private final SeriesMapper seriesMapper;
    private final ArticleMapper articleMapper;
    private final UserMapper userMapper;
    private final CategoryMapper categoryMapper;

    public PageResult<SeriesResponse> listPublished(int page, int size) {
        Page<Series> pageParam = new Page<>(page, size);
        Page<Series> result = seriesMapper.selectPage(
                pageParam,
                new LambdaQueryWrapper<Series>().orderByDesc(Series::getUpdatedAt)
        );
        List<SeriesResponse> records = result.getRecords().stream().map(this::toSummary).toList();
        return PageResult.of(result.getCurrent(), result.getSize(), result.getTotal(), records);
    }

    public SeriesResponse getBySlug(String slug) {
        Series series = seriesMapper.selectOne(new LambdaQueryWrapper<Series>().eq(Series::getSlug, slug));
        if (series == null) {
            throw new BusinessException(404, "Series not found");
        }
        List<Article> articles = articleMapper.selectList(
                new LambdaQueryWrapper<Article>()
                        .eq(Article::getSeriesId, series.getId())
                        .eq(Article::getStatus, ArticleStatus.PUBLISHED)
                        .orderByAsc(Article::getSeriesOrder)
                        .orderByDesc(Article::getPublishedAt)
        );
        List<ArticleResponse> articleResponses = articles.stream()
                .map(this::toArticleSummary)
                .toList();
        return SeriesResponse.builder()
                .id(series.getId())
                .title(series.getTitle())
                .slug(series.getSlug())
                .description(series.getDescription())
                .coverImage(series.getCoverImage())
                .articleCount(articleResponses.size())
                .articles(articleResponses)
                .createdAt(series.getCreatedAt())
                .updatedAt(series.getUpdatedAt())
                .build();
    }

    public PageResult<SeriesResponse> listManage(int page, int size) {
        SecurityUtils.requireAdmin();
        Page<Series> pageParam = new Page<>(page, size);
        Page<Series> result = seriesMapper.selectPage(
                pageParam,
                new LambdaQueryWrapper<Series>().orderByDesc(Series::getUpdatedAt)
        );
        return PageResult.of(
                result.getCurrent(),
                result.getSize(),
                result.getTotal(),
                result.getRecords().stream().map(this::toSummary).toList()
        );
    }

    @Transactional
    public SeriesResponse create(SeriesRequest request) {
        SecurityUtils.requireAdmin();
        String slug = resolveSlug(request.getSlug(), request.getTitle(), null);
        Series series = new Series();
        series.setTitle(request.getTitle().trim());
        series.setSlug(slug);
        series.setDescription(request.getDescription());
        series.setCoverImage(request.getCoverImage());
        seriesMapper.insert(series);
        return toSummary(series);
    }

    @Transactional
    public SeriesResponse update(Long id, SeriesRequest request) {
        SecurityUtils.requireAdmin();
        Series series = requireSeries(id);
        String slug = resolveSlug(request.getSlug(), request.getTitle(), id);
        series.setTitle(request.getTitle().trim());
        series.setSlug(slug);
        series.setDescription(request.getDescription());
        series.setCoverImage(request.getCoverImage());
        seriesMapper.updateById(series);
        return toSummary(series);
    }

    @Transactional
    public void delete(Long id) {
        SecurityUtils.requireAdmin();
        requireSeries(id);
        articleMapper.update(
                null,
                new com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper<Article>()
                        .eq(Article::getSeriesId, id)
                        .set(Article::getSeriesId, null)
                        .set(Article::getSeriesOrder, 0)
        );
        seriesMapper.deleteById(id);
    }

    public List<SeriesResponse> listAllBrief() {
        return seriesMapper.selectList(
                new LambdaQueryWrapper<Series>().orderByDesc(Series::getUpdatedAt)
        ).stream().map(this::toSummary).toList();
    }

    private Series requireSeries(Long id) {
        Series series = seriesMapper.selectById(id);
        if (series == null) {
            throw new BusinessException(404, "Series not found");
        }
        return series;
    }

    private SeriesResponse toSummary(Series series) {
        long count = articleMapper.selectCount(
                new LambdaQueryWrapper<Article>()
                        .eq(Article::getSeriesId, series.getId())
                        .eq(Article::getStatus, ArticleStatus.PUBLISHED)
        );
        return SeriesResponse.builder()
                .id(series.getId())
                .title(series.getTitle())
                .slug(series.getSlug())
                .description(series.getDescription())
                .coverImage(series.getCoverImage())
                .articleCount((int) count)
                .articles(Collections.emptyList())
                .createdAt(series.getCreatedAt())
                .updatedAt(series.getUpdatedAt())
                .build();
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

    private ArticleResponse toArticleSummary(Article article) {
        User author = userMapper.selectById(article.getAuthorId());
        Category category = article.getCategoryId() != null ? categoryMapper.selectById(article.getCategoryId()) : null;
        return ArticleResponse.builder()
                .id(article.getId())
                .title(article.getTitle())
                .slug(article.getSlug())
                .summary(article.getSummary())
                .coverImage(article.getCoverImage())
                .status(article.getStatus())
                .authorId(article.getAuthorId())
                .authorName(author != null ? author.getNickname() : null)
                .categoryId(article.getCategoryId())
                .categoryName(category != null ? category.getName() : null)
                .seriesId(article.getSeriesId())
                .seriesOrder(article.getSeriesOrder())
                .viewCount(article.getViewCount())
                .publishedAt(article.getPublishedAt())
                .build();
    }

    private boolean isSlugTaken(String slug, Long excludeId) {
        LambdaQueryWrapper<Series> wrapper = new LambdaQueryWrapper<Series>().eq(Series::getSlug, slug);
        if (excludeId != null) {
            wrapper.ne(Series::getId, excludeId);
        }
        return seriesMapper.selectCount(wrapper) > 0;
    }
}
