package com.iumeatelier.utils;

public final class MarkdownUtil {

  private MarkdownUtil() {}

  public static String toHtml(String markdown) {
    if (markdown == null) {
      return "";
    }
    String html = markdown
        .replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;");
    html = html.replaceAll("(?m)^### (.+)$", "<h3>$1</h3>");
    html = html.replaceAll("(?m)^## (.+)$", "<h2>$1</h2>");
    html = html.replaceAll("(?m)^# (.+)$", "<h1>$1</h1>");
    html = html.replaceAll("(?m)^- (.+)$", "<li>$1</li>");
    html = html.replaceAll("(\r\n|\n)", "<br/>");
    return "<div class=\"markdown-body\">" + html + "</div>";
  }
}
