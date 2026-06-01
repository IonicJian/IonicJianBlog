CREATE TABLE friend_links (
    id              SERIAL          PRIMARY KEY,
    name            VARCHAR(128)    NOT NULL,
    url             VARCHAR(512)    NOT NULL,
    description     TEXT            NOT NULL DEFAULT '',
    logo_url        VARCHAR(512)    NOT NULL DEFAULT '',
    sort_order      INT             NOT NULL DEFAULT 0,
    is_active       BOOLEAN         NOT NULL DEFAULT true,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_friend_links_sort ON friend_links(sort_order ASC, id ASC);
