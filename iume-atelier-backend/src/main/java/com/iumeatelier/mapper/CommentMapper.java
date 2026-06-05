package com.iumeatelier.mapper;

import com.iumeatelier.entity.BlogComment;
import java.util.List;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Options;
import org.apache.ibatis.annotations.Select;

@Mapper
public interface CommentMapper {

  @Select(
      "SELECT * FROM blog_comment WHERE article_id = #{articleId} AND is_deleted = 0 "
          + "AND status = 'VISIBLE' ORDER BY create_time DESC")
  List<BlogComment> listByArticle(Long articleId);

  @Insert(
      "INSERT INTO blog_comment(article_id, user_id, nickname, content, status) "
          + "VALUES(#{articleId}, #{userId}, #{nickname}, #{content}, #{status})")
  @Options(useGeneratedKeys = true, keyProperty = "id")
  int insert(BlogComment comment);
}
