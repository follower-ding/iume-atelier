package com.iumeatelier.entity;

import com.baomidou.mybatisplus.annotation.FieldFill;
import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableLogic;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("ai_tools")
public class AiTool {

    @TableId(type = IdType.AUTO)
    private Long id;

    private String slug;

    private String name;

    private String description;

    private String category;

    private String icon;

    @TableField("tags_json")
    private String tagsJson;

    private String url;

    private Boolean featured;

    private String source;

    @TableField("detail_json")
    private String detailJson;

    private Integer sortOrder;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updatedAt;

    @TableLogic
    private Integer deleted;
}
