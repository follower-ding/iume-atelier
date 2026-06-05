package com.iumeatelier.service;

import com.iumeatelier.entity.Article;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
public class RssService {

    private final ArticleService articleService;

    @Value("${iume.app.site-url:http://localhost:5173}")
    private String siteUrl;

    private static final DateTimeFormatter RFC822 = DateTimeFormatter.ofPattern("EEE, dd MMM yyyy HH:mm:ss Z");

    public String generateRssFeed() {
        List<Article> articles = articleService.listPublishedForFeed();
        StringBuilder sb = new StringBuilder();
        sb.append("<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n");
        sb.append("<rss version=\"2.0\" xmlns:atom=\"http://www.w3.org/2005/Atom\">\n");
        sb.append("  <channel>\n");
        sb.append("    <title>Iume Atelier</title>\n");
        sb.append("    <link>").append(escapeXml(siteUrl)).append("</link>\n");
        sb.append("    <description>Latest articles from Iume Atelier</description>\n");
        sb.append("    <language>en-us</language>\n");
        sb.append("    <atom:link href=\"").append(escapeXml(siteUrl)).append("/api/rss\" rel=\"self\" type=\"application/rss+xml\"/>\n");

        for (Article article : articles) {
            sb.append("    <item>\n");
            sb.append("      <title>").append(escapeXml(article.getTitle())).append("</title>\n");
            sb.append("      <link>").append(escapeXml(siteUrl)).append("/articles/").append(escapeXml(article.getSlug())).append("</link>\n");
            sb.append("      <guid>").append(escapeXml(siteUrl)).append("/articles/").append(escapeXml(article.getSlug())).append("</guid>\n");
            if (article.getPublishedAt() != null) {
                sb.append("      <pubDate>")
                        .append(escapeXml(article.getPublishedAt().atZone(ZoneOffset.systemDefault()).format(RFC822)))
                        .append("</pubDate>\n");
            }
            if (article.getSummary() != null) {
                sb.append("      <description>").append(escapeXml(article.getSummary())).append("</description>\n");
            }
            sb.append("    </item>\n");
        }

        sb.append("  </channel>\n");
        sb.append("</rss>");
        return sb.toString();
    }

    private String escapeXml(String input) {
        if (input == null) {
            return "";
        }
        return input
                .replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;")
                .replace("'", "&apos;");
    }
}
