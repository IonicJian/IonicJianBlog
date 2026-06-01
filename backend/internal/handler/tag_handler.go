package handler

import (
	"github.com/gin-gonic/gin"
	resp "github.com/zanelin/blog/internal/pkg/response"
)

type TagHandler struct{}

func NewTagHandler() *TagHandler {
	return &TagHandler{}
}

func (h *TagHandler) List(c *gin.Context)   { resp.Success(c, nil) }
func (h *TagHandler) Create(c *gin.Context) { resp.Success(c, nil) }
func (h *TagHandler) Update(c *gin.Context) { resp.Success(c, nil) }
func (h *TagHandler) Delete(c *gin.Context) { resp.Success(c, nil) }
