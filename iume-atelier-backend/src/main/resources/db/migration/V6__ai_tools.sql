CREATE TABLE ai_tools (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    slug        VARCHAR(100) NOT NULL,
    name        VARCHAR(120) NOT NULL,
    description VARCHAR(500) NOT NULL,
    category    VARCHAR(20)  NOT NULL,
    icon        VARCHAR(20)  NOT NULL DEFAULT '🔌',
    tags_json   JSON         DEFAULT NULL,
    url         VARCHAR(500) DEFAULT NULL,
    featured    TINYINT      NOT NULL DEFAULT 0,
    source      VARCHAR(20)  DEFAULT 'official',
    detail_json JSON         NOT NULL,
    sort_order  INT          NOT NULL DEFAULT 0,
    created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted     TINYINT      NOT NULL DEFAULT 0,
    UNIQUE KEY uk_ai_tools_slug (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
