package com.iumeatelier.utils;

import org.springframework.util.StringUtils;

import java.text.Normalizer;
import java.util.regex.Pattern;

public final class SlugUtils {

    private static final Pattern NON_LATIN = Pattern.compile("[^\\w-]");
    private static final Pattern WHITESPACE = Pattern.compile("[\\s_]+");
    private static final Pattern MULTIPLE_HYPHENS = Pattern.compile("-{2,}");
    private static final Pattern CJK = Pattern.compile("\\p{IsHan}");

    private SlugUtils() {
    }

    public static String fromTitle(String title) {
        if (!StringUtils.hasText(title)) {
            return "article";
        }
        String trimmed = title.trim();

        String slug = trimmed.toLowerCase();
        slug = Normalizer.normalize(slug, Normalizer.Form.NFD);
        slug = NON_LATIN.matcher(slug).replaceAll("-");
        slug = WHITESPACE.matcher(slug).replaceAll("-");
        slug = MULTIPLE_HYPHENS.matcher(slug).replaceAll("-");
        slug = slug.replaceAll("^-|-$", "");

        if (!StringUtils.hasText(slug) || CJK.matcher(trimmed).find()) {
            int hash = Math.abs(trimmed.hashCode());
            slug = "post-" + hash;
        }

        if (slug.length() > 180) {
            slug = slug.substring(0, 180).replaceAll("-$", "");
        }
        return slug;
    }
}
