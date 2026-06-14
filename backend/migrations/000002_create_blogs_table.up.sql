CREATE TABLE blogs (
    id              BIGSERIAL       PRIMARY KEY,
    user_id         BIGINT          NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title           VARCHAR(255)    NOT NULL,
    slug            VARCHAR(255)    NOT NULL UNIQUE,
    content         TEXT            NOT NULL,
    content_html    TEXT            NOT NULL DEFAULT '',
    excerpt         TEXT            NOT NULL DEFAULT '',
    cover_image     VARCHAR(512)    NOT NULL DEFAULT '',
    status          VARCHAR(16)     NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
    view_count      INT             NOT NULL DEFAULT 0,
    is_top          BOOLEAN         NOT NULL DEFAULT false,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_blogs_user_id ON blogs(user_id);
CREATE INDEX idx_blogs_status ON blogs(status);
CREATE INDEX idx_blogs_created_at ON blogs(created_at DESC);
CREATE INDEX idx_blogs_slug ON blogs(slug);
CREATE INDEX idx_blogs_status_created ON blogs(status, created_at DESC);
CREATE INDEX idx_blogs_fts ON blogs USING GIN(to_tsvector('simple', title || ' ' || content));
