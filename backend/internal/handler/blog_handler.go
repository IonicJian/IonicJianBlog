package handler

import (
	"github.com/gin-gonic/gin"
	resp "github.com/zanelin/blog/internal/pkg/response"
)

type BlogHandler struct{}

func NewBlogHandler() *BlogHandler {
	return &BlogHandler{}
}

func (h *BlogHandler) List(c *gin.Context)     { resp.Success(c, nil) }
func (h *BlogHandler) Search(c *gin.Context)    { resp.Success(c, nil) }
func (h *BlogHandler) GetTop(c *gin.Context)    { resp.Success(c, nil) }
func (h *BlogHandler) GetByID(c *gin.Context)   { resp.Success(c, nil) }
func (h *BlogHandler) GetBySlug(c *gin.Context) { resp.Success(c, nil) }
func (h *BlogHandler) Create(c *gin.Context)    { resp.Success(c, nil) }
func (h *BlogHandler) Update(c *gin.Context)    { resp.Success(c, nil) }
func (h *BlogHandler) Delete(c *gin.Context)    { resp.Success(c, nil) }
