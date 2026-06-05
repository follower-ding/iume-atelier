package com.iumeatelier.service;

import com.iumeatelier.entity.Article;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SitemapService {

    private final ArticleService articleService;

    @Value("${iume.app.site-url:http://localhost:5173}")
    private String siteUrl;

    private static final DateTimeFormatter W3C = DateTimeFormatter.ISO_LOCAL_DATE;

    public String generateSitemap() {
        List<Article> articles = articleService.listPublishedForFeed();
        StringBuilder sb = new StringBuilder();
        sb.append("<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n");
        sb.append("<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">\n");

        appendUrl(sb, siteUrl + "/", null, "daily", "1.0");

        for (Article article : articles) {
            String loc = siteUrl + "/articles/" + article.getSlug();
            String lastmod = article.getUpdatedAt() != null
                    ? article.getUpdatedAt().format(W3C)
                    : null;
            appendUrl(sb, loc, lastmod, "weekly", "0.8");
        }

        sb.append("</urlset>");
        return sb.toString();
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
