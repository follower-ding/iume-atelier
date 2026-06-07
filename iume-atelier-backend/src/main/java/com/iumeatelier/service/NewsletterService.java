package com.iumeatelier.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.iumeatelier.common.PageResult;
import com.iumeatelier.dto.request.NewsletterSubscribeRequest;
import com.iumeatelier.entity.NewsletterSubscriber;
import com.iumeatelier.exception.BusinessException;
import com.iumeatelier.mapper.NewsletterSubscriberMapper;
import com.iumeatelier.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NewsletterService {

    private final NewsletterSubscriberMapper subscriberMapper;

    @Transactional
    public void subscribe(NewsletterSubscribeRequest request) {
        String email = request.getEmail().trim().toLowerCase();
        if (subscriberMapper.selectCount(
                new LambdaQueryWrapper<NewsletterSubscriber>().eq(NewsletterSubscriber::getEmail, email)) > 0) {
            throw new BusinessException("Email already subscribed");
        }
        NewsletterSubscriber subscriber = new NewsletterSubscriber();
        subscriber.setEmail(email);
        subscriberMapper.insert(subscriber);
    }

    public PageResult<String> listEmails(int page, int size) {
        SecurityUtils.requireAdmin();
        Page<NewsletterSubscriber> pageParam = new Page<>(page, size);
        Page<NewsletterSubscriber> result = subscriberMapper.selectPage(
                pageParam,
                new LambdaQueryWrapper<NewsletterSubscriber>().orderByDesc(NewsletterSubscriber::getSubscribedAt)
        );
        List<String> emails = result.getRecords().stream().map(NewsletterSubscriber::getEmail).toList();
        return PageResult.of(result.getCurrent(), result.getSize(), result.getTotal(), emails);
    }

    public long count() {
        return subscriberMapper.selectCount(null);
    }

    public String exportCsv() {
        SecurityUtils.requireAdmin();
        List<NewsletterSubscriber> all = subscriberMapper.selectList(
                new LambdaQueryWrapper<NewsletterSubscriber>().orderByAsc(NewsletterSubscriber::getSubscribedAt)
        );
        StringBuilder sb = new StringBuilder("email,subscribed_at\n");
        for (NewsletterSubscriber s : all) {
            sb.append(s.getEmail()).append(',').append(s.getSubscribedAt()).append('\n');
        }
        return sb.toString();
    }
}
