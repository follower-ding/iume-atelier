-- Iume Atelier initial schema and seed data

CREATE TABLE IF NOT EXISTS users (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    username    VARCHAR(50)  NOT NULL UNIQUE,
    password    VARCHAR(255) NOT NULL,
    email       VARCHAR(100) NOT NULL UNIQUE,
    nickname    VARCHAR(50)  NOT NULL,
    avatar      VARCHAR(500) DEFAULT NULL,
    role        VARCHAR(20)  NOT NULL DEFAULT 'USER',
    created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted     TINYINT      NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS categories (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(50)  NOT NULL UNIQUE,
    slug        VARCHAR(50)  NOT NULL UNIQUE,
    description VARCHAR(255) DEFAULT NULL,
    created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted     TINYINT      NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS tags (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(50)  NOT NULL UNIQUE,
    slug        VARCHAR(50)  NOT NULL UNIQUE,
    created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted     TINYINT      NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS articles (
    id           BIGINT AUTO_INCREMENT PRIMARY KEY,
    title        VARCHAR(200) NOT NULL,
    slug         VARCHAR(200) NOT NULL UNIQUE,
    content      LONGTEXT     NOT NULL,
    summary      VARCHAR(500) DEFAULT NULL,
    cover_image  VARCHAR(500) DEFAULT NULL,
    status       VARCHAR(20)  NOT NULL DEFAULT 'DRAFT',
    author_id    BIGINT       NOT NULL,
    category_id  BIGINT       DEFAULT NULL,
    view_count   INT          NOT NULL DEFAULT 0,
    created_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    published_at DATETIME     DEFAULT NULL,
    deleted      TINYINT      NOT NULL DEFAULT 0,
    CONSTRAINT fk_articles_author FOREIGN KEY (author_id) REFERENCES users (id),
    CONSTRAINT fk_articles_category FOREIGN KEY (category_id) REFERENCES categories (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS article_tags (
    id         BIGINT AUTO_INCREMENT PRIMARY KEY,
    article_id BIGINT NOT NULL,
    tag_id     BIGINT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_article_tag (article_id, tag_id),
    CONSTRAINT fk_article_tags_article FOREIGN KEY (article_id) REFERENCES articles (id),
    CONSTRAINT fk_article_tags_tag FOREIGN KEY (tag_id) REFERENCES tags (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS comments (
    id         BIGINT AUTO_INCREMENT PRIMARY KEY,
    article_id BIGINT       NOT NULL,
    user_id    BIGINT       NOT NULL,
    content    TEXT         NOT NULL,
    parent_id  BIGINT       DEFAULT NULL,
    created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted    TINYINT      NOT NULL DEFAULT 0,
    CONSTRAINT fk_comments_article FOREIGN KEY (article_id) REFERENCES articles (id),
    CONSTRAINT fk_comments_user FOREIGN KEY (user_id) REFERENCES users (id),
    CONSTRAINT fk_comments_parent FOREIGN KEY (parent_id) REFERENCES comments (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_articles_status ON articles (status);
CREATE INDEX idx_articles_author ON articles (author_id);
CREATE INDEX idx_articles_published_at ON articles (published_at);
CREATE INDEX idx_comments_article ON comments (article_id);

-- Seed: admin user (password: admin123)
INSERT INTO users (username, password, email, nickname, role)
VALUES ('admin', '$2b$10$iM.JFnSJriILJjHQY3BIWusenLyCn5/bNg2eHW/4DmZLlCrEcb9Xa', 'admin@iumeatelier.com', 'Admin', 'ADMIN');

-- Seed: categories
INSERT INTO categories (name, slug, description) VALUES
('Technology', 'technology', 'Articles about software development and tech trends'),
('Design', 'design', 'UI/UX, visual design and creative workflows'),
('Life', 'life', 'Personal essays and lifestyle notes');

-- Seed: tags
INSERT INTO tags (name, slug) VALUES
('Java', 'java'),
('Spring Boot', 'spring-boot'),
('Frontend', 'frontend'),
('Tutorial', 'tutorial');

-- Seed: published articles
INSERT INTO articles (title, slug, content, summary, cover_image, status, author_id, category_id, view_count, published_at)
VALUES (
    'Getting Started with Spring Boot 3',
    'getting-started-with-spring-boot-3',
    '# Getting Started with Spring Boot 3\n\nSpring Boot 3 brings Jakarta EE 10, native compilation support, and improved observability.\n\n## Key Features\n\n- Java 17 baseline\n- Virtual threads preview\n- Improved GraalVM native image support\n\nStart your project today with Spring Initializr!',
    'An introduction to Spring Boot 3 and its key features for modern Java development.',
    'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800',
    'PUBLISHED',
    1,
    1,
    128,
    NOW()
);

INSERT INTO articles (title, slug, content, summary, cover_image, status, author_id, category_id, view_count, published_at)
VALUES (
    'Building a Modern Blog with React and Vite',
    'building-modern-blog-react-vite',
    '# Building a Modern Blog\n\nReact combined with Vite offers a blazing-fast development experience.\n\n## Why Vite?\n\n- Instant server start\n- Lightning-fast HMR\n- Optimized production builds\n\nPair it with TypeScript for a robust frontend stack.',
    'Learn how to build a fast, modern blog frontend using React and Vite.',
    'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800',
    'PUBLISHED',
    1,
    1,
    86,
    NOW()
);

INSERT INTO article_tags (article_id, tag_id) VALUES
(1, 1),
(1, 2),
(1, 4),
(2, 3),
(2, 4);
