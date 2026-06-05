package com.iumeatelier.service;

import com.iumeatelier.dto.CommentCreateDto;
import com.iumeatelier.entity.BlogComment;
import java.util.List;

public interface CommentService {

  List<BlogComment> listByArticle(Long articleId);

  void create(Long userId, String nickname, CommentCreateDto dto);
}
