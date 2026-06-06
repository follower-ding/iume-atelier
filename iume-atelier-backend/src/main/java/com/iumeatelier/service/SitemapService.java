package com.iumeatelier.service;

import com.iumeatelier.entity.Article;
import com.iumeatelier.entity.Category;
import com.iumeatelier.entity.Tag;
import com.iumeatelier.mapper.CategoryMapper;
import com.iumeatelier.mapper.TagMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SitemapService {

    private final ArticleService articleService;
    private final CategoryMapper categoryMapper;
    private final TagMapper tagMapper;

    @Value("${iume.app.site-url:http://localhost:5173}")
    private String siteUrl;

    private static final DateTimeFormatter W3C = DateTimeFormatter.ISO_LOCAL_DATE;

    public String generateSitemap() {
        List<Article> articles = articleService.listPublishedForFeed();
        List<Category> categories = categoryMapper.selectList(null);
        List<Tag> tags = tagMapper.selectList(null);

        String base = siteUrl.replaceAll("/$", "");
        StringBuilder sb = new StringBuilder();
        sb.append("<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n");
        sb.append("<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">\n");

        appendUrl(sb, base + "/", null, "daily", "1.0");
        appendUrl(sb, base + "/articles", null, "daily", "0.9");
        appendUrl(sb, base + "/about", null, "monthly", "0.7");
        appendUrl(sb, base + "/projects", null, "weekly", "0.7");
        appendUrl(sb, base + "/tools", null, "monthly", "0.6");

        for (Category category : categories) {
            appendUrl(sb, base + "/articles?category=" + category.getId(), formatDate(category.getUpdatedAt()), "weekly", "0.6");
        }

        for (Tag tag : tags) {
            appendUrl(sb, base + "/articles?tag=" + tag.getId(), formatDate(tag.getCreatedAt()), "weekly", "0.5");
        }

        for (Article article : articles) {
            String loc = base + "/article/" + article.getSlug();
            String lastmod = formatDate(article.getUpdatedAt());
            appendUrl(sb, loc, lastmod, "weekly", "0.8");
        }

        sb.append("</urlset>");
        return sb.toString();
    }

    private String formatDate(java.time.LocalDateTime dateTime) {
        return dateTime != null ? dateTime.format(W3C) : null;
    }

    private void appendUrl(StringBuilder sb, String loc, String lastmod, String changefreq, String priority) {
        sb.append("  <url>\n");
        sb.append("    <loc>").append(escapeXml(loc)).append("</loc>\n");
        if (lastmod != null) {
            sb.append("    <lastmod>").append(lastmod).append("</lastmod>\n");
        }
        sb.append("    <changefreq>").append(changefreq).append("</changefreq>\n");
        sb.append("    <priority>").append(priority).append("</priority>\n");
        sb.append("  </url>\n");
    }

    private String escapeXml(String input) {
        return input
                .replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;")
                .replace("'", "&apos;");
    }
}
