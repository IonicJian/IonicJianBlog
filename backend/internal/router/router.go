package router

import (
	"github.com/gin-gonic/gin"
	"github.com/zanelin/blog/internal/config"
	"github.com/zanelin/blog/internal/handler"
	"github.com/zanelin/blog/internal/middleware"
)

type Handlers struct {
	Auth       *handler.AuthHandler
	User       *handler.UserHandler
	Blog       *handler.BlogHandler
	Comment    *handler.CommentHandler
	Like       *handler.LikeHandler
	Tag        *handler.TagHandler
	FriendLink *handler.FriendLinkHandler
	Guestbook  *handler.GuestbookHandler
	AI         *handler.AIHandler
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

	// Public auth routes
	auth := api.Group("/auth")
	{
		auth.POST("/register", h.Auth.Register)
		auth.POST("/login", h.Auth.Login)
		auth.POST("/refresh", h.Auth.RefreshToken)
		auth.GET("/github", h.Auth.GitHubLogin)
		auth.GET("/github/callback", h.Auth.GitHubCallback)
	}

	// Auth-protected routes (any logged-in user)
	authRequired := api.Group("")
	authRequired.Use(middleware.RequiredAuth(cfg.JWT.Secret))
	{
		authRequired.POST("/auth/logout", h.Auth.Logout)
		authRequired.GET("/users/me", h.Auth.GetProfile)
		authRequired.PUT("/users/me", h.Auth.UpdateProfile)
		authRequired.PUT("/users/me/avatar", h.Auth.UpdateProfile)

		authRequired.POST("/blogs/:id/comments", h.Comment.Create)
		authRequired.DELETE("/comments/:id", h.Comment.Delete)

		authRequired.POST("/blogs/:id/like", h.Like.ToggleBlogLike)
		authRequired.POST("/comments/:id/like", h.Like.ToggleCommentLike)
		authRequired.GET("/blogs/:id/like/status", h.Like.GetBlogLikeStatus)
		authRequired.GET("/comments/:id/like/status", h.Like.GetCommentLikeStatus)

		authRequired.POST("/guestbook", h.Guestbook.Create)
		authRequired.DELETE("/guestbook/:id", h.Guestbook.Delete)
	}

	// Admin-only routes (blog CRUD, tags, friend links, AI)
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
		adminRequired.POST("/blogs/:id/summary", h.AI.GenerateSummary)
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
		optionalAuth.GET("/blogs/:id/summary", h.AI.GetSummary)
		optionalAuth.GET("/trending/github", h.AI.GetGithubTrending)
		optionalAuth.GET("/users/:id", h.User.GetUser)
	}
}
