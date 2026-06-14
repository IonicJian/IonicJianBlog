package social

import (
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/zanelin/blog/internal/middleware"
	resp "github.com/zanelin/blog/internal/pkg/response"
	socialSvc "github.com/zanelin/blog/internal/service/social"
)

type LikeHandler struct {
	service socialSvc.LikeService
}

func NewLikeHandler(s socialSvc.LikeService) *LikeHandler { return &LikeHandler{service: s} }

func (h *LikeHandler) toggleLike(c *gin.Context, targetType string) {
	targetID, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil { resp.BadRequest(c, "invalid id"); return }
	userID := c.GetInt64(middleware.ContextKeyUserID)
	liked, count, err := h.service.Toggle(c.Request.Context(), userID, targetType, targetID)
	if err != nil { resp.InternalError(c, err.Error()); return }
	resp.Success(c, gin.H{"liked": liked, "count": count})
}

func (h *LikeHandler) getStatus(c *gin.Context, targetType string) {
	targetID, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil { resp.BadRequest(c, "invalid id"); return }
	userID := c.GetInt64(middleware.ContextKeyUserID)
	liked, count, err := h.service.GetStatus(c.Request.Context(), userID, targetType, targetID)
	if err != nil { resp.InternalError(c, err.Error()); return }
	resp.Success(c, gin.H{"liked": liked, "count": count})
}

func (h *LikeHandler) ToggleBlogLike(c *gin.Context)    { h.toggleLike(c, "blog") }
func (h *LikeHandler) ToggleCommentLike(c *gin.Context)  { h.toggleLike(c, "comment") }
func (h *LikeHandler) GetBlogLikeStatus(c *gin.Context)  { h.getStatus(c, "blog") }
func (h *LikeHandler) GetCommentLikeStatus(c *gin.Context) { h.getStatus(c, "comment") }
