package com.iumeatelier.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.iumeatelier.common.PageResult;
import com.iumeatelier.dto.response.ArticleResponse;
import com.iumeatelier.dto.response.UserResponse;
import com.iumeatelier.entity.Article;
import com.iumeatelier.entity.User;
import com.iumeatelier.enums.ArticleStatus;
import com.iumeatelier.enums.UserRole;
import com.iumeatelier.exception.BusinessException;
import com.iumeatelier.mapper.ArticleMapper;
import com.iumeatelier.mapper.UserMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AuthorService {

    private final UserMapper userMapper;
    private final ArticleMapper articleMapper;
    private final ArticleService articleService;

    public List<UserResponse> listAuthors() {
        List<Article> published = articleMapper.selectList(
                new LambdaQueryWrapper<Article>().eq(Article::getStatus, ArticleStatus.PUBLISHED)
        );
        Set<Long> authorIds = published.stream().map(Article::getAuthorId).collect(Collectors.toSet());
        if (authorIds.isEmpty()) {
            return List.of();
        }
        return userMapper.selectBatchIds(authorIds).stream()
                .filter(u -> isPublicAuthor(u.getRole()))
                .map(this::toUserResponse)
                .toList();
    }

    public UserResponse getAuthor(Long id) {
        User user = userMapper.selectById(id);
        if (user == null || !isPublicAuthor(user.getRole())) {
            throw new BusinessException(404, "Author not found");
        }
        long count = articleMapper.selectCount(
                new LambdaQueryWrapper<Article>()
                        .eq(Article::getAuthorId, id)
                        .eq(Article::getStatus, ArticleStatus.PUBLISHED)
        );
        UserResponse response = toUserResponse(user);
        return response;
    }

    public PageResult<ArticleResponse> listArticles(Long authorId, int page, int size) {
        User user = userMapper.selectById(authorId);
        if (user == null || !isPublicAuthor(user.getRole())) {
            throw new BusinessException(404, "Author not found");
        }
        Page<Article> pageParam = new Page<>(page, size);
        Page<Article> result = articleMapper.selectPage(
                pageParam,
                new LambdaQueryWrapper<Article>()
                        .eq(Article::getAuthorId, authorId)
                        .eq(Article::getStatus, ArticleStatus.PUBLISHED)
                        .orderByDesc(Article::getPublishedAt)
        );
        List<ArticleResponse> records = result.getRecords().stream()
                .map(a -> articleService.getById(a.getId(), false))
                .toList();
        return PageResult.of(result.getCurrent(), result.getSize(), result.getTotal(), records);
    }

    private boolean isPublicAuthor(String role) {
        return UserRole.ADMIN.name().equals(role) || UserRole.AUTHOR.name().equals(role);
    }

    private UserResponse toUserResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .nickname(user.getNickname())
                .avatar(user.getAvatar())
                .role(user.getRole())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
