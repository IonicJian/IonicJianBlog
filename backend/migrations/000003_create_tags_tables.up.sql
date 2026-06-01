CREATE TABLE tags (
    id              SERIAL          PRIMARY KEY,
    name            VARCHAR(64)     NOT NULL UNIQUE,
    slug            VARCHAR(64)     NOT NULL UNIQUE,
    color           VARCHAR(7)      NOT NULL DEFAULT '#6366f1',
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_tags_name ON tags(name);

CREATE TABLE blog_tags (
    blog_id         BIGINT          NOT NULL REFERENCES blogs(id) ON DELETE CASCADE,
    tag_id          INT             NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (blog_id, tag_id)
);

CREATE INDEX idx_blog_tags_tag_id ON blog_tags(tag_id);
