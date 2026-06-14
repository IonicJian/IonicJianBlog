package main

import (
	"context"
	"fmt"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/rs/zerolog"
	"github.com/rs/zerolog/log"
	"golang.org/x/crypto/bcrypt"

	"github.com/zanelin/blog/internal/config"
	authH "github.com/zanelin/blog/internal/handler/auth"
	blogH "github.com/zanelin/blog/internal/handler/blog"
	contentH "github.com/zanelin/blog/internal/handler/content"
	socialH "github.com/zanelin/blog/internal/handler/social"
	trendingH "github.com/zanelin/blog/internal/handler/trending"
	userH "github.com/zanelin/blog/internal/handler/user"
	blogR "github.com/zanelin/blog/internal/repository/blog"
	contentR "github.com/zanelin/blog/internal/repository/content"
	socialR "github.com/zanelin/blog/internal/repository/social"
	userR "github.com/zanelin/blog/internal/repository/user"
	"github.com/zanelin/blog/internal/router"
	authS "github.com/zanelin/blog/internal/service/auth"
	blogS "github.com/zanelin/blog/internal/service/blog"
	contentS "github.com/zanelin/blog/internal/service/content"
	socialS "github.com/zanelin/blog/internal/service/social"
	trendingS "github.com/zanelin/blog/internal/service/trending"
)

func main() {
	zerolog.TimeFieldFormat = zerolog.TimeFormatUnix
	log.Logger = log.Output(zerolog.ConsoleWriter{Out: os.Stdout, TimeFormat: time.RFC3339})

	cfg, err := config.Load()
	if err != nil {
		log.Fatal().Err(err).Msg("failed to load config")
	}
	gin.SetMode(cfg.Server.Mode)

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	dbPool, err := pgxpool.New(ctx, cfg.Database.DSN)
	if err != nil {
		log.Fatal().Err(err).Msg("failed to connect to database")
	}
	defer dbPool.Close()
	if err := dbPool.Ping(ctx); err != nil {
		log.Fatal().Err(err).Msg("failed to ping database")
	}
	log.Info().Msg("connected to database")

	if err := runMigrations(dbPool); err != nil {
		log.Fatal().Err(err).Msg("failed to run migrations")
	}

	adminEmail := os.Getenv("ADMIN_EMAIL")
	if adminEmail == "" {
		adminEmail = "admin@blog.local"
	}
	adminPassword := os.Getenv("ADMIN_PASSWORD")
	if adminPassword == "" {
		adminPassword = "admin123"
	}
	if err := seedAdmin(dbPool, adminEmail, adminPassword); err != nil {
		log.Fatal().Err(err).Msg("failed to seed admin user")
	}

	// Repos
	userRepo := userR.New(dbPool)
	blogRepo := blogR.New(dbPool)
	tagRepo := contentR.NewTagRepository(dbPool)
	commentRepo := socialR.NewCommentRepository(dbPool)
	likeRepo := socialR.NewLikeRepository(dbPool)
	friendLinkRepo := contentR.NewFriendLinkRepository(dbPool)
	guestbookRepo := socialR.NewGuestbookRepository(dbPool)
	categoryRepo := contentR.NewCategoryRepository(dbPool)

	// Services
	authService := authS.New(userRepo, cfg)
	tagService := contentS.NewTagService(tagRepo)
	blogService := blogS.New(blogRepo, tagRepo)
	commentService := socialS.NewCommentService(commentRepo)
	likeService := socialS.NewLikeService(likeRepo)
	friendLinkService := contentS.NewFriendLinkService(friendLinkRepo)
	guestbookService := socialS.NewGuestbookService(guestbookRepo)
	trendingService := trendingS.New()
	categoryService := contentS.NewCategoryService(categoryRepo)

	// Graceful refresh for trending
	refreshCtx, cancelRefresh := context.WithCancel(context.Background())
	defer cancelRefresh()
	go func() {
		ticker := time.NewTicker(1 * time.Hour)
		defer ticker.Stop()
		for {
			select {
			case <-ticker.C:
				trendingService.Refresh()
			case <-refreshCtx.Done():
				return
			}
		}
	}()

	// Handlers
	h := &router.Handlers{
		Auth:       authH.New(authService, cfg),
		User:       userH.New(),
		Blog:       blogH.New(blogService),
		Comment:    socialH.NewCommentHandler(commentService),
		Like:       socialH.NewLikeHandler(likeService),
		Tag:        contentH.NewTagHandler(tagService),
		FriendLink: contentH.NewFriendLinkHandler(friendLinkService),
		Guestbook:  socialH.NewGuestbookHandler(guestbookService),
		Trending:   trendingH.New(trendingService),
		Category:   contentH.NewCategoryHandler(categoryService),
	}

	r := gin.New()
	router.Setup(r, h, cfg)

	// Serve uploaded files
	r.Static("/uploads", "./uploads")

	srv := &http.Server{Addr: cfg.Server.Port, Handler: r}
	go func() {
		log.Info().Str("port", cfg.Server.Port).Msg("starting server")
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatal().Err(err).Msg("server failed")
		}
	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit
	log.Info().Msg("shutting down server...")
	ctx, cancel = context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	srv.Shutdown(ctx)
	log.Info().Msg("server stopped")
}

func runMigrations(pool *pgxpool.Pool) error {
	migrations := []struct{ name, sql string }{
		{"000001_create_users_table", createUsersTable},
		{"000002_create_blogs_table", createBlogsTable},
		{"000003_create_tags_tables", createTagsTables},
		{"000004_create_comments_table", createCommentsTable},
		{"000005_create_likes_table", createLikesTable},
		{"000006_create_friend_links_table", createFriendLinksTable},
		{"000007_create_guestbook_table", createGuestbookTable},
		{"000008_create_ai_summaries_table", createAISummariesTable},
		{"000009_enable_pg_trgm", `CREATE EXTENSION IF NOT EXISTS pg_trgm`},
		{"000010_create_categories_table", createCategoriesTable},
	}
	pool.Exec(context.Background(), `CREATE TABLE IF NOT EXISTS schema_migrations (version VARCHAR(255) PRIMARY KEY, applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW())`)
	for _, m := range migrations {
		var exists bool
		pool.QueryRow(context.Background(), "SELECT EXISTS(SELECT 1 FROM schema_migrations WHERE version=$1)", m.name).Scan(&exists)
		if exists {
			continue
		}
		if _, err := pool.Exec(context.Background(), m.sql); err != nil {
			return fmt.Errorf("migration %s: %w", m.name, err)
		}
		pool.Exec(context.Background(), "INSERT INTO schema_migrations (version) VALUES ($1)", m.name)
		log.Info().Str("migration", m.name).Msg("applied migration")
	}
	return nil
}

const createUsersTable = `CREATE TABLE IF NOT EXISTS users (id BIGSERIAL PRIMARY KEY, username VARCHAR(64) NOT NULL UNIQUE, email VARCHAR(255) NOT NULL UNIQUE, password_hash VARCHAR(255) NOT NULL DEFAULT '', display_name VARCHAR(128) NOT NULL DEFAULT '', avatar_url VARCHAR(512) NOT NULL DEFAULT '', bio TEXT NOT NULL DEFAULT '', github_id BIGINT NULL UNIQUE, role VARCHAR(16) NOT NULL DEFAULT 'user' CHECK (role IN ('user','admin')), is_active BOOLEAN NOT NULL DEFAULT true, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()); CREATE INDEX IF NOT EXISTS idx_users_email ON users(email); CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);`
const createBlogsTable = `CREATE TABLE IF NOT EXISTS blogs (id BIGSERIAL PRIMARY KEY, user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE, title VARCHAR(255) NOT NULL, slug VARCHAR(255) NOT NULL UNIQUE, content TEXT NOT NULL, content_html TEXT NOT NULL DEFAULT '', excerpt TEXT NOT NULL DEFAULT '', cover_image VARCHAR(512) NOT NULL DEFAULT '', status VARCHAR(16) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published')), view_count INT NOT NULL DEFAULT 0, is_top BOOLEAN NOT NULL DEFAULT false, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()); CREATE INDEX IF NOT EXISTS idx_blogs_slug ON blogs(slug); CREATE INDEX IF NOT EXISTS idx_blogs_status_created ON blogs(status, created_at DESC);`
const createTagsTables = `CREATE TABLE IF NOT EXISTS tags (id SERIAL PRIMARY KEY, name VARCHAR(64) NOT NULL UNIQUE, slug VARCHAR(64) NOT NULL UNIQUE, color VARCHAR(7) NOT NULL DEFAULT '#6366f1', created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()); CREATE TABLE IF NOT EXISTS blog_tags (blog_id BIGINT NOT NULL REFERENCES blogs(id) ON DELETE CASCADE, tag_id INT NOT NULL REFERENCES tags(id) ON DELETE CASCADE, PRIMARY KEY (blog_id, tag_id));`
const createCommentsTable = `CREATE TABLE IF NOT EXISTS comments (id BIGSERIAL PRIMARY KEY, blog_id BIGINT NOT NULL REFERENCES blogs(id) ON DELETE CASCADE, user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE, parent_id BIGINT NULL REFERENCES comments(id) ON DELETE CASCADE, content TEXT NOT NULL, anchor_start VARCHAR(64) NULL, anchor_end VARCHAR(64) NULL, anchor_text TEXT NULL, is_approved BOOLEAN NOT NULL DEFAULT true, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()); CREATE INDEX IF NOT EXISTS idx_comments_blog_id ON comments(blog_id);`
const createLikesTable = `CREATE TABLE IF NOT EXISTS likes (id BIGSERIAL PRIMARY KEY, user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE, target_type VARCHAR(16) NOT NULL CHECK (target_type IN ('blog','comment')), target_id BIGINT NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), UNIQUE (user_id, target_type, target_id));`
const createFriendLinksTable = `CREATE TABLE IF NOT EXISTS friend_links (id SERIAL PRIMARY KEY, name VARCHAR(128) NOT NULL, url VARCHAR(512) NOT NULL, description TEXT NOT NULL DEFAULT '', logo_url VARCHAR(512) NOT NULL DEFAULT '', sort_order INT NOT NULL DEFAULT 0, is_active BOOLEAN NOT NULL DEFAULT true, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW());`
const createGuestbookTable = `CREATE TABLE IF NOT EXISTS guestbook_messages (id BIGSERIAL PRIMARY KEY, user_id BIGINT NULL REFERENCES users(id) ON DELETE SET NULL, nickname VARCHAR(128) NOT NULL DEFAULT '', content TEXT NOT NULL, is_approved BOOLEAN NOT NULL DEFAULT true, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW());`
const createAISummariesTable = `CREATE TABLE IF NOT EXISTS ai_summaries (id BIGSERIAL PRIMARY KEY, blog_id BIGINT NOT NULL REFERENCES blogs(id) ON DELETE CASCADE UNIQUE, summary TEXT NOT NULL, model VARCHAR(64) NOT NULL DEFAULT '', tokens_used INT NOT NULL DEFAULT 0, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW());`
const createCategoriesTable = `CREATE TABLE IF NOT EXISTS categories (id SERIAL PRIMARY KEY, name VARCHAR(64) NOT NULL UNIQUE, slug VARCHAR(64) NOT NULL UNIQUE, description TEXT NOT NULL DEFAULT '', sort_order INT NOT NULL DEFAULT 0, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()); ALTER TABLE blogs ADD COLUMN IF NOT EXISTS category_id INT NULL REFERENCES categories(id) ON DELETE SET NULL;`

func seedAdmin(pool *pgxpool.Pool, email, password string) error {
	ctx := context.Background()
	var count int64
	pool.QueryRow(ctx, "SELECT COUNT(*) FROM users WHERE role='admin'").Scan(&count)
	if count > 0 {
		log.Info().Msg("admin user already exists, skipping seed")
		return nil
	}
	hash, err := bcrypt.GenerateFromPassword([]byte(password), 12)
	if err != nil {
		return fmt.Errorf("seedAdmin: hash: %w", err)
	}
	_, err = pool.Exec(ctx, `INSERT INTO users (username, email, password_hash, display_name, role, is_active) VALUES ($1,$2,$3,$4,'admin',true) ON CONFLICT (email) DO NOTHING`, "admin", email, string(hash), "Admin")
	if err != nil {
		return fmt.Errorf("seedAdmin: insert: %w", err)
	}
	log.Info().Str("email", email).Msg("seeded admin user")
	return nil
}
