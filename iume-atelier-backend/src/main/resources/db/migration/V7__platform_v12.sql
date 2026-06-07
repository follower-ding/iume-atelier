-- v1.2 platform: password flag, media, newsletter, series, analytics, fulltext search

ALTER TABLE users
    ADD COLUMN must_change_password TINYINT(1) NOT NULL DEFAULT 0 AFTER role;

UPDATE users SET must_change_password = 1 WHERE username = 'admin';

CREATE TABLE IF NOT EXISTS media_assets (
    id            BIGINT AUTO_INCREMENT PRIMARY KEY,
    stored_name   VARCHAR(120)  NOT NULL,
    original_name VARCHAR(255)  DEFAULT NULL,
    content_type  VARCHAR(100)  NOT NULL,
    size_bytes    BIGINT        NOT NULL DEFAULT 0,
    public_url    VARCHAR(1000) NOT NULL,
    uploader_id   BIGINT        DEFAULT NULL,
    created_at    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted       TINYINT       NOT NULL DEFAULT 0,
    CONSTRAINT fk_media_uploader FOREIGN KEY (uploader_id) REFERENCES users (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_media_created ON media_assets (created_at);

CREATE TABLE IF NOT EXISTS newsletter_subscribers (
    id            BIGINT AUTO_INCREMENT PRIMARY KEY,
    email         VARCHAR(200) NOT NULL,
    subscribed_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_newsletter_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS series (
    id           BIGINT AUTO_INCREMENT PRIMARY KEY,
    title        VARCHAR(200) NOT NULL,
    slug         VARCHAR(200) NOT NULL UNIQUE,
    description  VARCHAR(500) DEFAULT NULL,
    cover_image  VARCHAR(500) DEFAULT NULL,
    created_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted      TINYINT      NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE articles
    ADD COLUMN series_id BIGINT DEFAULT NULL AFTER category_id,
    ADD COLUMN series_order INT NOT NULL DEFAULT 0 AFTER series_id;

ALTER TABLE articles
    ADD CONSTRAINT fk_articles_series FOREIGN KEY (series_id) REFERENCES series (id);

CREATE TABLE IF NOT EXISTS page_views (
    id         BIGINT AUTO_INCREMENT PRIMARY KEY,
    path       VARCHAR(500)  NOT NULL,
    article_id BIGINT        DEFAULT NULL,
    referrer   VARCHAR(1000) DEFAULT NULL,
    user_agent VARCHAR(500)  DEFAULT NULL,
    created_at DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_page_views_article FOREIGN KEY (article_id) REFERENCES articles (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_page_views_created ON page_views (created_at);
CREATE INDEX idx_page_views_article ON page_views (article_id);

ALTER TABLE articles ADD FULLTEXT INDEX ft_articles_search (title, summary, content);
