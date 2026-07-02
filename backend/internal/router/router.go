package router

import (
	"github.com/gin-gonic/gin"
	"github.com/zanelin/blog/internal/config"
	"github.com/zanelin/blog/internal/handler/auth"
	"github.com/zanelin/blog/internal/handler/blog"
	"github.com/zanelin/blog/internal/handler/content"
	"github.com/zanelin/blog/internal/handler/social"
	"github.com/zanelin/blog/internal/handler/trending"
	"github.com/zanelin/blog/internal/middleware"
)

type Handlers struct {
	Auth       *auth.Handler
	Blog       *blog.Handler
	Comment    *social.CommentHandler
	Like       *social.LikeHandler
	Tag        *content.TagHandler
	FriendLink *content.FriendLinkHandler
	Guestbook  *social.GuestbookHandler
	Trending   *trending.Handler
	Category   *content.CategoryHandler
}

func Setup(r *gin.Engine, h *Handlers, cfg *config.Config) {
	r.Use(middleware.Recovery())
	r.Use(middleware.CORS(cfg.Server.FrontendURL))
	r.Use(middleware.Logger())

	api := r.Group("/api/v1")

	// Health check
	api.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok"})
	})

	// Site owner
	api.GET("/site/owner", h.Auth.GetSiteOwner)

	// Rate limiters
	loginLimiter := middleware.RateLimit(10, 10.0/60.0)    // 10 req/min
	registerLimiter := middleware.RateLimit(5, 5.0/60.0)   // 5 req/min

	// Public auth routes
	authGroup := api.Group("/auth")
	{
		authGroup.POST("/register", registerLimiter, h.Auth.Register)
		authGroup.POST("/login", loginLimiter, h.Auth.Login)
		authGroup.POST("/refresh", h.Auth.RefreshToken)
		authGroup.GET("/github", h.Auth.GitHubLogin)
		authGroup.GET("/github/callback", h.Auth.GitHubCallback)
			authGroup.POST("/exchange-code", h.Auth.ExchangeCode)
	}

	// Auth-protected routes (any logged-in user)
	authRequired := api.Group("")
	authRequired.Use(middleware.RequiredAuth(cfg.JWT.Secret))
	{
		authRequired.POST("/auth/logout", h.Auth.Logout)
		authRequired.GET("/users/me", h.Auth.GetProfile)
		authRequired.PUT("/users/me", h.Auth.UpdateProfile)
		authRequired.POST("/users/me/avatar/upload", h.Auth.UploadAvatar)
		authRequired.POST("/upload/image", blog.UploadImage)

		authRequired.POST("/blogs/:id/comments", h.Comment.Create)
		authRequired.DELETE("/comments/:id", h.Comment.Delete)

		authRequired.POST("/blogs/:id/like", h.Like.ToggleBlogLike)
		authRequired.POST("/comments/:id/like", h.Like.ToggleCommentLike)
		authRequired.GET("/blogs/:id/like/status", h.Like.GetBlogLikeStatus)
		authRequired.GET("/comments/:id/like/status", h.Like.GetCommentLikeStatus)

		authRequired.POST("/guestbook", h.Guestbook.Create)
		authRequired.DELETE("/guestbook/:id", h.Guestbook.Delete)
	}

	// Admin-only routes
	adminRequired := api.Group("")
	adminRequired.Use(middleware.RequiredAuth(cfg.JWT.Secret), middleware.RequireAdmin())
	{
		adminRequired.POST("/blogs", h.Blog.Create)
		adminRequired.PUT("/blogs/:id", h.Blog.Update)
		adminRequired.DELETE("/blogs/:id", h.Blog.Delete)

		adminRequired.POST("/tags", h.Tag.Create)
		adminRequired.PUT("/tags/:id", h.Tag.Update)
		adminRequired.DELETE("/tags/:id", h.Tag.Delete)

		adminRequired.POST("/friend-links", h.FriendLink.Create)
		adminRequired.PUT("/friend-links/:id", h.FriendLink.Update)
		adminRequired.DELETE("/friend-links/:id", h.FriendLink.Delete)

		adminRequired.POST("/blogs/:id/summary", h.Trending.GenerateSummary)
		adminRequired.POST("/categories", h.Category.Create)
		adminRequired.PUT("/categories/:id", h.Category.Update)
		adminRequired.DELETE("/categories/:id", h.Category.Delete)
	}

	// Public + optionally authenticated routes
	optionalAuth := api.Group("")
	optionalAuth.Use(middleware.OptionalAuth(cfg.JWT.Secret))
	{
		optionalAuth.GET("/blogs", h.Blog.List)
		optionalAuth.GET("/blogs/search", h.Blog.Search)
		optionalAuth.GET("/blogs/top", h.Blog.GetTop)
		optionalAuth.GET("/blogs/:id", h.Blog.GetByID)
		optionalAuth.GET("/blogs/slug/:slug", h.Blog.GetBySlug)
		optionalAuth.POST("/blogs/:id/view", h.Blog.IncrementView)
		optionalAuth.GET("/blogs/:id/comments", h.Comment.List)
		optionalAuth.GET("/tags", h.Tag.List)
		optionalAuth.GET("/friend-links", h.FriendLink.List)
		optionalAuth.GET("/guestbook", h.Guestbook.List)
		optionalAuth.GET("/blogs/:id/summary", h.Trending.GetSummary)
		optionalAuth.GET("/trending/github", h.Trending.GetGithubTrending)
		optionalAuth.GET("/categories", h.Category.List)
	}
}
