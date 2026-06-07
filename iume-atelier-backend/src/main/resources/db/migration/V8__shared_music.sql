-- v1.2.2: site-wide shared music catalog

CREATE TABLE IF NOT EXISTS shared_music_tracks (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    title       VARCHAR(200)  NOT NULL,
    artist      VARCHAR(200)  NOT NULL DEFAULT '',
    src         VARCHAR(1000) NOT NULL,
    cover       VARCHAR(1000) DEFAULT NULL,
    sort_order  INT           NOT NULL DEFAULT 0,
    created_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted     TINYINT       NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_shared_music_sort ON shared_music_tracks (sort_order, created_at);
