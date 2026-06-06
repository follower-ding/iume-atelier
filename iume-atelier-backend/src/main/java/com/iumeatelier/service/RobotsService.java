package com.iumeatelier.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class RobotsService {

    @Value("${iume.app.site-url:http://localhost:5173}")
    private String siteUrl;

    public String generate() {
        String apiBase = siteUrl.replaceAll("/$", "");
        if (apiBase.contains(":5173")) {
            apiBase = apiBase.replace(":5173", ":8080") + "/api";
        } else {
            apiBase = apiBase + "/api";
        }

        return """
                User-agent: *
                Allow: /
                Disallow: /console
                Disallow: /admin
                Disallow: /login
                Disallow: /register
                Disallow: /settings

                Sitemap: %s/sitemap.xml
                """.formatted(apiBase).stripTrailing();
    }
}
