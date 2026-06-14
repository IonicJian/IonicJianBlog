CREATE TABLE comments (
    id              BIGSERIAL       PRIMARY KEY,
    blog_id         BIGINT          NOT NULL REFERENCES blogs(id) ON DELETE CASCADE,
    user_id         BIGINT          NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    parent_id       BIGINT          NULL REFERENCES comments(id) ON DELETE CASCADE,
    content         TEXT            NOT NULL,
    anchor_start    VARCHAR(64)     NULL,
    anchor_end      VARCHAR(64)     NULL,
    anchor_text     TEXT            NULL,
    is_approved     BOOLEAN         NOT NULL DEFAULT true,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_comments_blog_id ON comments(blog_id);
CREATE INDEX idx_comments_user_id ON comments(user_id);
CREATE INDEX idx_comments_parent_id ON comments(parent_id);
CREATE INDEX idx_comments_blog_created ON comments(blog_id, created_at ASC);
