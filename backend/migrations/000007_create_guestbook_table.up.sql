CREATE TABLE guestbook_messages (
    id              BIGSERIAL       PRIMARY KEY,
    user_id         BIGINT          NULL REFERENCES users(id) ON DELETE SET NULL,
    nickname        VARCHAR(128)    NOT NULL DEFAULT '',
    content         TEXT            NOT NULL,
    is_approved     BOOLEAN         NOT NULL DEFAULT true,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_guestbook_created ON guestbook_messages(created_at DESC);
