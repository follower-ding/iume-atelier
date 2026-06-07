-- Repair partial V8 deploy: table exists but sort index missing

SET @idx_exists := (
    SELECT COUNT(*)
    FROM information_schema.statistics
    WHERE table_schema = DATABASE()
      AND table_name = 'shared_music_tracks'
      AND index_name = 'idx_shared_music_sort'
);
SET @ddl := IF(
    @idx_exists = 0
        AND (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'shared_music_tracks') > 0,
    'ALTER TABLE shared_music_tracks ADD INDEX idx_shared_music_sort (sort_order, created_at)',
    'SELECT 1'
);
PREPARE stmt FROM @ddl;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
