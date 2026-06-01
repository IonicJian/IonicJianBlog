CREATE TABLE ai_summaries (
    id              BIGSERIAL       PRIMARY KEY,
    blog_id         BIGINT          NOT NULL REFERENCES blogs(id) ON DELETE CASCADE UNIQUE,
    summary         TEXT            NOT NULL,
    model           VARCHAR(64)     NOT NULL DEFAULT '',
    tokens_used     INT             NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ai_summaries_blog_id ON ai_summaries(blog_id);
