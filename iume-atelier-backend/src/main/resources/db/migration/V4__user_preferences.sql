ALTER TABLE users
    ADD COLUMN preferences JSON NULL COMMENT 'User personalization: companion quotes, music playlist' AFTER avatar;
