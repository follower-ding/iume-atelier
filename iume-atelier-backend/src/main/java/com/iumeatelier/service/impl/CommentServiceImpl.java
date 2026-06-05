package com.iumeatelier.service.impl;

import com.iumeatelier.dto.CommentCreateDto;
import com.iumeatelier.entity.BlogComment;
import com.iumeatelier.mapper.CommentMapper;
import com.iumeatelier.service.CommentService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CommentServiceImpl implements CommentService {

  private final CommentMapper commentMapper;

  @Override
  public List<BlogComment> listByArticle(Long articleId) {
    return commentMapper.listByArticle(articleId);
  }

  @Override
  public void create(Long userId, String nickname, CommentCreateDto dto) {
    BlogComment comment = new BlogComment();
    comment.setArticleId(dto.getArticleId());
    comment.setUserId(userId);
    comment.setNickname(nickname);
    comment.setContent(dto.getContent());
    comment.setStatus("VISIBLE");
    commentMapper.insert(comment);
  }
}
