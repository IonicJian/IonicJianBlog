CREATE TABLE users (
    id              BIGSERIAL       PRIMARY KEY,
    username        VARCHAR(64)     NOT NULL UNIQUE,
    email           VARCHAR(255)    NOT NULL UNIQUE,
    password_hash   VARCHAR(255)    NOT NULL DEFAULT '',
    display_name    VARCHAR(128)    NOT NULL DEFAULT '',
    avatar_url      VARCHAR(512)    NOT NULL DEFAULT '',
    bio             TEXT            NOT NULL DEFAULT '',
    github_id       BIGINT          NULL UNIQUE,
    role            VARCHAR(16)     NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    is_active       BOOLEAN         NOT NULL DEFAULT true,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_github_id ON users(github_id);
