package com.iumeatelier.mapper;

import com.iumeatelier.entity.BlogTag;
import java.util.List;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Options;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

@Mapper
public interface TagMapper {

  @Select("SELECT * FROM blog_tag WHERE is_deleted = 0 ORDER BY name")
  List<BlogTag> listAll();

  @Select("SELECT * FROM blog_tag WHERE name = #{name} AND is_deleted = 0 LIMIT 1")
  BlogTag findByName(String name);

  @Insert("INSERT INTO blog_tag(name, slug) VALUES(#{name}, #{slug})")
  @Options(useGeneratedKeys = true, keyProperty = "id")
  int insert(BlogTag tag);

  @Insert("INSERT IGNORE INTO blog_article_tag(article_id, tag_id) VALUES(#{articleId}, #{tagId})")
  int linkArticle(@Param("articleId") Long articleId, @Param("tagId") Long tagId);

  @Select(
      "SELECT t.name FROM blog_tag t JOIN blog_article_tag at ON t.id = at.tag_id "
          + "WHERE at.article_id = #{articleId} AND t.is_deleted = 0")
  List<String> namesByArticle(Long articleId);
}
