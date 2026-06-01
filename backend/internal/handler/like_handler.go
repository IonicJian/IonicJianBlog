package handler

import (
	"github.com/gin-gonic/gin"
	resp "github.com/zanelin/blog/internal/pkg/response"
)

type LikeHandler struct{}

func NewLikeHandler() *LikeHandler {
	return &LikeHandler{}
}

func (h *LikeHandler) ToggleBlogLike(c *gin.Context)       { resp.Success(c, nil) }
func (h *LikeHandler) ToggleCommentLike(c *gin.Context)    { resp.Success(c, nil) }
func (h *LikeHandler) GetBlogLikeStatus(c *gin.Context)     { resp.Success(c, nil) }
func (h *LikeHandler) GetCommentLikeStatus(c *gin.Context)  { resp.Success(c, nil) }
