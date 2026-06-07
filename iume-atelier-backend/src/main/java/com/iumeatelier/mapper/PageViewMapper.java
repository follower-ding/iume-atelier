package com.iumeatelier.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.iumeatelier.dto.response.TopArticleViewResponse;
import com.iumeatelier.entity.PageView;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.time.LocalDateTime;
import java.util.List;

@Mapper
public interface PageViewMapper extends BaseMapper<PageView> {

    @Select("""
            SELECT a.id AS articleId, a.title AS title, a.slug AS slug, COUNT(*) AS viewCount
            FROM page_views pv
            JOIN articles a ON a.id = pv.article_id AND a.deleted = 0
            WHERE pv.created_at >= #{since}
            GROUP BY a.id, a.title, a.slug
            ORDER BY viewCount DESC
            LIMIT #{limit}
            """)
    List<TopArticleViewResponse> topArticlesSince(
            @Param("since") LocalDateTime since,
            @Param("limit") int limit
    );
}
