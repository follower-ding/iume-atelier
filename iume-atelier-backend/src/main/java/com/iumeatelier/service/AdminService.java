package com.iumeatelier.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.iumeatelier.common.PageResult;
import com.iumeatelier.dto.request.AdminUserCreateRequest;
import com.iumeatelier.dto.request.AdminUserUpdateRequest;
import com.iumeatelier.dto.request.BatchArticleStatusRequest;
import com.iumeatelier.dto.response.AdminCommentResponse;
import com.iumeatelier.dto.response.AdminStatsResponse;
import com.iumeatelier.dto.response.TrendPoint;
import com.iumeatelier.dto.response.UserResponse;
import com.iumeatelier.entity.Article;
import com.iumeatelier.entity.ArticleTag;
import com.iumeatelier.entity.Comment;
import com.iumeatelier.entity.User;
import com.iumeatelier.enums.ArticleStatus;
import com.iumeatelier.enums.UserRole;
import com.iumeatelier.exception.BusinessException;
import com.iumeatelier.mapper.ArticleMapper;
import com.iumeatelier.mapper.ArticleTagMapper;
import com.iumeatelier.mapper.CategoryMapper;
import com.iumeatelier.mapper.CommentMapper;
import com.iumeatelier.mapper.TagMapper;
import com.iumeatelier.mapper.UserMapper;
import com.iumeatelier.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminService {

    private static final int TREND_DAYS = 7;

    private final UserMapper userMapper;
    private final ArticleMapper articleMapper;
    private final ArticleTagMapper articleTagMapper;
    private final CommentMapper commentMapper;
    private final CategoryMapper categoryMapper;
    private final TagMapper tagMapper;
    private final AuthService authService;
    private final PasswordEncoder passwordEncoder;
    private final AdminAuditLogService auditLogService;

    public AdminStatsResponse getStats() {
        SecurityUtils.requireAdmin();
        LocalDateTime since = LocalDate.now().minusDays(TREND_DAYS - 1L).atStartOfDay();
        return AdminStatsResponse.builder()
                .userCount(userMapper.selectCount(null))
                .articleCount(articleMapper.selectCount(null))
                .publishedCount(articleMapper.selectCount(
                        new LambdaQueryWrapper<Article>().eq(Article::getStatus, ArticleStatus.PUBLISHED)))
                .draftCount(articleMapper.selectCount(
                        new LambdaQueryWrapper<Article>().eq(Article::getStatus, ArticleStatus.DRAFT)))
                .commentCount(commentMapper.selectCount(null))
                .categoryCount(categoryMapper.selectCount(null))
                .tagCount(tagMapper.selectCount(null))
                .userTrend(buildTrend(userMapper.selectList(
                        new LambdaQueryWrapper<User>().ge(User::getCreatedAt, since)), TREND_DAYS))
                .articleTrend(buildTrendFromArticles(articleMapper.selectList(
                        new LambdaQueryWrapper<Article>().ge(Article::getCreatedAt, since)), TREND_DAYS))
                .commentTrend(buildTrendFromComments(commentMapper.selectList(
                        new LambdaQueryWrapper<Comment>().ge(Comment::getCreatedAt, since)), TREND_DAYS))
                .build();
    }

    public PageResult<UserResponse> listUsers(int page, int size, String keyword) {
        SecurityUtils.requireAdmin();
        Page<User> pageParam = new Page<>(page, size);
        LambdaQueryWrapper<User> wrapper = new LambdaQueryWrapper<User>()
                .orderByDesc(User::getCreatedAt);
        if (StringUtils.hasText(keyword)) {
            String kw = keyword.trim();
            wrapper.and(w -> w.like(User::getUsername, kw)
                    .or().like(User::getNickname, kw)
                    .or().like(User::getEmail, kw));
        }
        Page<User> result = userMapper.selectPage(pageParam, wrapper);
        List<UserResponse> records = result.getRecords().stream().map(this::toUserResponse).toList();
        return PageResult.of(result.getCurrent(), result.getSize(), result.getTotal(), records);
    }

    @Transactional
    public UserResponse createUser(AdminUserCreateRequest request) {
        SecurityUtils.requireAdmin();
        if (userMapper.selectCount(new LambdaQueryWrapper<User>().eq(User::getUsername, request.getUsername())) > 0) {
            throw new BusinessException("Username already exists");
        }
        if (userMapper.selectCount(new LambdaQueryWrapper<User>().eq(User::getEmail, request.getEmail())) > 0) {
            throw new BusinessException("Email already exists");
        }

        String role = UserRole.USER.name();
        if (StringUtils.hasText(request.getRole())) {
            try {
                UserRole.valueOf(request.getRole());
                role = request.getRole();
            } catch (IllegalArgumentException ex) {
                throw new BusinessException("Invalid role");
            }
        }

        User user = new User();
        user.setUsername(request.getUsername().trim());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setEmail(request.getEmail().trim());
        user.setNickname(request.getNickname().trim());
        user.setRole(role);
        userMapper.insert(user);

        auditLogService.log("CREATE_USER", "USER", user.getId(), user.getUsername());
        return toUserResponse(user);
    }

    @Transactional
    public UserResponse updateUser(Long id, AdminUserUpdateRequest request) {
        SecurityUtils.requireAdmin();
        User user = userMapper.selectById(id);
        if (user == null) {
            throw new BusinessException(404, "User not found");
        }

        if (StringUtils.hasText(request.getEmail()) && !request.getEmail().equals(user.getEmail())) {
            if (userMapper.selectCount(new LambdaQueryWrapper<User>().eq(User::getEmail, request.getEmail())) > 0) {
                throw new BusinessException("Email already exists");
            }
            user.setEmail(request.getEmail().trim());
        }

        if (request.getNickname() != null) {
            user.setNickname(request.getNickname().trim());
        }

        if (StringUtils.hasText(request.getRole())) {
            try {
                UserRole.valueOf(request.getRole());
            } catch (IllegalArgumentException ex) {
                throw new BusinessException("Invalid role");
            }
            if (user.getId().equals(SecurityUtils.getCurrentUserId()) && !UserRole.ADMIN.name().equals(request.getRole())) {
                throw new BusinessException("Cannot demote yourself");
            }
            user.setRole(request.getRole());
        }

        userMapper.updateById(user);
        auditLogService.log("UPDATE_USER", "USER", id, user.getUsername());
        return toUserResponse(user);
    }

    @Transactional
    public void deleteUser(Long id) {
        SecurityUtils.requireAdmin();
        if (id.equals(SecurityUtils.getCurrentUserId())) {
            throw new BusinessException("Cannot delete yourself");
        }
        User user = userMapper.selectById(id);
        if (user == null) {
            throw new BusinessException(404, "User not found");
        }
        userMapper.deleteById(id);
        auditLogService.log("DELETE_USER", "USER", id, user.getUsername());
    }

    @Transactional
    public int batchDeleteUsers(List<Long> ids) {
        SecurityUtils.requireAdmin();
        Long currentId = SecurityUtils.getCurrentUserId();
        int deleted = 0;
        for (Long id : ids) {
            if (id.equals(currentId)) {
                continue;
            }
            User user = userMapper.selectById(id);
            if (user != null) {
                userMapper.deleteById(id);
                deleted++;
            }
        }
        if (deleted > 0) {
            auditLogService.log("BATCH_DELETE_USERS", "USER", null, "count=" + deleted);
        }
        return deleted;
    }

    @Transactional
    public int batchDeleteArticles(List<Long> ids) {
        SecurityUtils.requireAdmin();
        int deleted = 0;
        for (Long id : ids) {
            Article article = articleMapper.selectById(id);
            if (article != null) {
                articleTagMapper.delete(new LambdaQueryWrapper<ArticleTag>().eq(ArticleTag::getArticleId, id));
                articleMapper.deleteById(id);
                deleted++;
            }
        }
        if (deleted > 0) {
            auditLogService.log("BATCH_DELETE_ARTICLES", "ARTICLE", null, "count=" + deleted);
        }
        return deleted;
    }

    @Transactional
    public int batchDeleteComments(List<Long> ids) {
        SecurityUtils.requireAdmin();
        int deleted = 0;
        for (Long id : ids) {
            if (commentMapper.selectById(id) != null) {
                commentMapper.deleteById(id);
                deleted++;
            }
        }
        if (deleted > 0) {
            auditLogService.log("BATCH_DELETE_COMMENTS", "COMMENT", null, "count=" + deleted);
        }
        return deleted;
    }

    @Transactional
    public int batchUpdateArticleStatus(BatchArticleStatusRequest request) {
        SecurityUtils.requireAdmin();
        ArticleStatus status;
        try {
            status = ArticleStatus.valueOf(request.getStatus());
        } catch (IllegalArgumentException ex) {
            throw new BusinessException("Invalid status");
        }

        int updated = 0;
        LocalDateTime now = LocalDateTime.now();
        for (Long id : request.getIds()) {
            Article article = articleMapper.selectById(id);
            if (article == null) {
                continue;
            }
            ArticleStatus oldStatus = article.getStatus();
            article.setStatus(status);
            if (oldStatus != ArticleStatus.PUBLISHED && status == ArticleStatus.PUBLISHED) {
                article.setPublishedAt(now);
            }
            articleMapper.updateById(article);
            updated++;
        }
        if (updated > 0) {
            auditLogService.log("BATCH_UPDATE_ARTICLE_STATUS", "ARTICLE", null,
                    "status=" + status + ", count=" + updated);
        }
        return updated;
    }

    public PageResult<AdminCommentResponse> listComments(int page, int size) {
        SecurityUtils.requireAdmin();
        Page<Comment> pageParam = new Page<>(page, size);
        Page<Comment> result = commentMapper.selectPage(pageParam,
                new LambdaQueryWrapper<Comment>().orderByDesc(Comment::getCreatedAt));

        List<Long> articleIds = result.getRecords().stream().map(Comment::getArticleId).distinct().toList();
        Map<Long, Article> articleMap = articleIds.isEmpty()
                ? Map.of()
                : articleMapper.selectBatchIds(articleIds).stream().collect(Collectors.toMap(Article::getId, a -> a));

        List<AdminCommentResponse> records = result.getRecords().stream()
                .map(c -> toAdminComment(c, articleMap.get(c.getArticleId())))
                .toList();
        return PageResult.of(result.getCurrent(), result.getSize(), result.getTotal(), records);
    }

    private List<TrendPoint> buildTrend(List<User> items, int days) {
        Map<LocalDate, Long> grouped = items.stream()
                .collect(Collectors.groupingBy(u -> u.getCreatedAt().toLocalDate(), Collectors.counting()));
        return fillDays(grouped, days);
    }

    private List<TrendPoint> buildTrendFromArticles(List<Article> items, int days) {
        Map<LocalDate, Long> grouped = items.stream()
                .collect(Collectors.groupingBy(a -> a.getCreatedAt().toLocalDate(), Collectors.counting()));
        return fillDays(grouped, days);
    }

    private List<TrendPoint> buildTrendFromComments(List<Comment> items, int days) {
        Map<LocalDate, Long> grouped = items.stream()
                .collect(Collectors.groupingBy(c -> c.getCreatedAt().toLocalDate(), Collectors.counting()));
        return fillDays(grouped, days);
    }

    private List<TrendPoint> fillDays(Map<LocalDate, Long> grouped, int days) {
        List<TrendPoint> result = new ArrayList<>();
        LocalDate today = LocalDate.now();
        for (int i = days - 1; i >= 0; i--) {
            LocalDate date = today.minusDays(i);
            result.add(new TrendPoint(date.toString(), grouped.getOrDefault(date, 0L)));
        }
        return result;
    }

    private AdminCommentResponse toAdminComment(Comment comment, Article article) {
        User user = authService.findById(comment.getUserId());
        return AdminCommentResponse.builder()
                .id(comment.getId())
                .articleId(comment.getArticleId())
                .articleTitle(article != null ? article.getTitle() : null)
                .articleSlug(article != null ? article.getSlug() : null)
                .userId(comment.getUserId())
                .username(user != null ? user.getUsername() : null)
                .nickname(user != null ? user.getNickname() : null)
                .content(comment.getContent())
                .parentId(comment.getParentId())
                .createdAt(comment.getCreatedAt())
                .build();
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
