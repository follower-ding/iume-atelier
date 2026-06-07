package com.iumeatelier.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("newsletter_subscribers")
public class NewsletterSubscriber {

    @TableId(type = IdType.AUTO)
    private Long id;

    private String email;

    private LocalDateTime subscribedAt;
}
