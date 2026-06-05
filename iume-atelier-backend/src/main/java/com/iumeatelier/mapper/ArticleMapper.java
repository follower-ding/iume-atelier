package com.iumeatelier.mapper;

import com.iumeatelier.entity.BlogArticle;
import java.util.List;
import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Options;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

@Mapper
public interface ArticleMapper {

  @Select(
      "SELECT * FROM blog_article WHERE is_deleted = 0 AND status = 'PUBLISHED' "
          + "ORDER BY published_at DESC, id DESC LIMIT #{limit} OFFSET #{offset}")
  List<BlogArticle> listPublished(@Param("offset") int offset, @Param("limit") int limit);

  @Select("SELECT * FROM blog_article WHERE slug = #{slug} AND is_deleted = 0 LIMIT 1")
  BlogArticle findBySlug(String slug);

  @Select("SELECT * FROM blog_article WHERE id = #{id} AND is_deleted = 0 LIMIT 1")
  BlogArticle findById(Long id);

  @Select(
      "SELECT * FROM blog_article WHERE is_deleted = 0 AND status = 'PUBLISHED' "
          + "AND (title LIKE CONCAT('%',#{q},'%') OR summary LIKE CONCAT('%',#{q},'%') "
          + "OR content_md LIKE CONCAT('%',#{q},'%')) ORDER BY published_at DESC LIMIT 50")
  List<BlogArticle> search(String q);

  @Select("SELECT * FROM blog_article WHERE is_deleted = 0 ORDER BY update_time DESC")
  List<BlogArticle> listAllAdmin();

  @Insert(
      "INSERT INTO blog_article(title, slug, summary, content_md, content_html, cover_url, status, "
          + "author_id, view_count, published_at) "
          + "VALUES(#{title}, #{slug}, #{summary}, #{contentMd}, #{contentHtml}, #{coverUrl}, "
          + "#{status}, #{authorId}, #{viewCount}, #{publishedAt})")
  @Options(useGeneratedKeys = true, keyProperty = "id")
  int insert(BlogArticle article);

  @Update(
      "UPDATE blog_article SET title=#{title}, slug=#{slug}, summary=#{summary}, content_md=#{contentMd}, "
          + "content_html=#{contentHtml}, cover_url=#{coverUrl}, status=#{status}, published_at=#{publishedAt} "
          + "WHERE id=#{id} AND is_deleted=0")
  int update(BlogArticle article);

  @Update("UPDATE blog_article SET view_count = view_count + 1 WHERE id = #{id}")
  int incrementView(Long id);

  @Update("UPDATE blog_article SET is_deleted = 1 WHERE id = #{id}")
  int softDelete(Long id);

  @Delete("DELETE FROM blog_article_tag WHERE article_id = #{articleId}")
  int clearTags(Long articleId);
}
