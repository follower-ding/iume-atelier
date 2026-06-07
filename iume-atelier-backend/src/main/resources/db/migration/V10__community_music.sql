-- Community music: track uploader + migrate all users' personal tracks into shared catalog

ALTER TABLE shared_music_tracks
    ADD COLUMN uploader_id BIGINT NULL COMMENT 'User who uploaded this track' AFTER sort_order;

CREATE INDEX idx_shared_music_uploader ON shared_music_tracks (uploader_id);

INSERT INTO shared_music_tracks (title, artist, src, sort_order, uploader_id, created_at, deleted)
SELECT
    jt.title,
    COALESCE(NULLIF(jt.artist, ''), COALESCE(u.nickname, u.username)),
    jt.src,
    0,
    u.id,
    COALESCE(
        STR_TO_DATE(REPLACE(SUBSTRING(jt.created_at_str, 1, 19), 'T', ' '), '%Y-%m-%d %H:%i:%s'),
        NOW()
    ),
    0
FROM users u
CROSS JOIN JSON_TABLE(
    u.preferences,
    '$.customTracks[*]' COLUMNS (
        title VARCHAR(200) CHARACTER SET utf8mb4 PATH '$.title',
        artist VARCHAR(200) CHARACTER SET utf8mb4 PATH '$.artist',
        src VARCHAR(1000) CHARACTER SET utf8mb4 PATH '$.src',
        created_at_str VARCHAR(50) CHARACTER SET utf8mb4 PATH '$.createdAt'
    )
) AS jt
WHERE u.preferences IS NOT NULL
  AND JSON_LENGTH(COALESCE(JSON_EXTRACT(u.preferences, '$.customTracks'), JSON_ARRAY())) > 0
  AND jt.src IS NOT NULL
  AND jt.title IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM shared_music_tracks s WHERE s.src = jt.src AND s.deleted = 0
  );
