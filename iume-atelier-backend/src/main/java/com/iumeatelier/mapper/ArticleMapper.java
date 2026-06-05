package com.iumeatelier.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.iumeatelier.entity.Article;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

@Mapper
public interface ArticleMapper extends BaseMapper<Article> {

    @Select("""
            SELECT * FROM articles
            WHERE deleted = 0
              AND status = 'PUBLISHED'
              AND (title LIKE CONCAT('%', #{keyword}, '%')
                   OR content LIKE CONCAT('%', #{keyword}, '%')
                   OR summary LIKE CONCAT('%', #{keyword}, '%'))
            ORDER BY published_at DESC
            """)
    IPage<Article> searchPublished(Page<Article> page, @Param("keyword") String keyword);

    @Update("UPDATE articles SET view_count = view_count + 1 WHERE id = #{id} AND deleted = 0")
    int incrementViewCount(@Param("id") Long id);
}
