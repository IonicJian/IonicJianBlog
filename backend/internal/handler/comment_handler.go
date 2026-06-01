package handler

import (
	"github.com/gin-gonic/gin"
	resp "github.com/zanelin/blog/internal/pkg/response"
)

type CommentHandler struct{}

func NewCommentHandler() *CommentHandler {
	return &CommentHandler{}
}

func (h *CommentHandler) List(c *gin.Context)   { resp.Success(c, nil) }
func (h *CommentHandler) Create(c *gin.Context)  { resp.Success(c, nil) }
func (h *CommentHandler) Delete(c *gin.Context)  { resp.Success(c, nil) }
