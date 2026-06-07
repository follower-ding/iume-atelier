-- Seed shared music from admin preferences and media library audio (one-time backfill)

INSERT INTO shared_music_tracks (title, artist, src, sort_order, created_at, deleted)
SELECT
    jt.title,
    COALESCE(NULLIF(jt.artist, ''), 'iume ambient'),
    jt.src,
    0,
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
WHERE u.role = 'ADMIN'
  AND u.preferences IS NOT NULL
  AND JSON_VALID(u.preferences) = 1
  AND JSON_LENGTH(COALESCE(JSON_EXTRACT(u.preferences, '$.customTracks'), JSON_ARRAY())) > 0
  AND jt.src IS NOT NULL
  AND jt.title IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM shared_music_tracks s WHERE s.src = jt.src AND s.deleted = 0
  );

INSERT INTO shared_music_tracks (title, artist, src, sort_order, created_at, deleted)
SELECT
    COALESCE(NULLIF(m.original_name, ''), m.stored_name),
    'iume ambient',
    m.public_url,
    0,
    m.created_at,
    0
FROM media_assets m
WHERE m.content_type LIKE 'audio/%'
  AND m.deleted = 0
  AND m.public_url IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM shared_music_tracks s WHERE s.src = m.public_url AND s.deleted = 0
  );
