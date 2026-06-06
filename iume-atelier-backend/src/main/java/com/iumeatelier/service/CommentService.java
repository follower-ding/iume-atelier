package com.iumeatelier.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.iumeatelier.dto.request.CommentRequest;
import com.iumeatelier.dto.response.CommentResponse;
import com.iumeatelier.entity.Article;
import com.iumeatelier.entity.Comment;
import com.iumeatelier.entity.User;
import com.iumeatelier.enums.ArticleStatus;
import com.iumeatelier.exception.BusinessException;
import com.iumeatelier.mapper.ArticleMapper;
import com.iumeatelier.mapper.CommentMapper;
import com.iumeatelier.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CommentService {

    private final CommentMapper commentMapper;
    private final ArticleMapper articleMapper;
    private final AuthService authService;

    public List<CommentResponse> listByArticle(Long articleId) {
        Article article = articleMapper.selectById(articleId);
        if (article == null || article.getStatus() != ArticleStatus.PUBLISHED) {
            throw new BusinessException(404, "Article not found");
        }

        List<Comment> comments = commentMapper.selectList(
                new LambdaQueryWrapper<Comment>()
                        .eq(Comment::getArticleId, articleId)
                        .orderByAsc(Comment::getCreatedAt));

        Map<Long, List<Comment>> repliesByParent = comments.stream()
                .filter(c -> c.getParentId() != null)
                .collect(Collectors.groupingBy(Comment::getParentId));

        return comments.stream()
                .filter(c -> c.getParentId() == null)
                .map(c -> toResponse(c, repliesByParent))
                .toList();
    }

    @Transactional
    public CommentResponse create(CommentRequest request, Long userId) {
        Article article = articleMapper.selectById(request.getArticleId());
        if (article == null || article.getStatus() != ArticleStatus.PUBLISHED) {
            throw new BusinessException(404, "Article not found");
        }

        if (request.getParentId() != null) {
            Comment parent = commentMapper.selectById(request.getParentId());
            if (parent == null || !parent.getArticleId().equals(request.getArticleId())) {
                throw new BusinessException("Invalid parent comment");
            }
        }

        Comment comment = new Comment();
        comment.setArticleId(request.getArticleId());
        comment.setUserId(userId);
        comment.setContent(request.getContent());
        comment.setParentId(request.getParentId());
        commentMapper.insert(comment);
        return toResponse(comment, Map.of());
    }

    @Transactional
    public void delete(Long id) {
        Comment comment = commentMapper.selectById(id);
        if (comment == null) {
            throw new BusinessException(404, "Comment not found");
        }
        Long currentUserId = SecurityUtils.getCurrentUserId();
        if (!comment.getUserId().equals(currentUserId) && !SecurityUtils.isAdmin()) {
            throw new BusinessException(403, "Not authorized to delete this comment");
        }
        commentMapper.deleteById(id);
    }

    private CommentResponse toResponse(Comment comment, Map<Long, List<Comment>> repliesByParent) {
        User user = authService.findById(comment.getUserId());
        List<CommentResponse> replies = new ArrayList<>();
        List<Comment> childComments = repliesByParent.getOrDefault(comment.getId(), List.of());
        for (Comment child : childComments) {
            replies.add(toResponse(child, repliesByParent));
        }

        return CommentResponse.builder()
                .id(comment.getId())
                .articleId(comment.getArticleId())
                .userId(comment.getUserId())
                .username(user != null ? user.getUsername() : null)
                .nickname(user != null ? user.getNickname() : null)
                .content(comment.getContent())
                .parentId(comment.getParentId())
                .createdAt(comment.getCreatedAt())
                .replies(replies)
                .build();
    }
}
