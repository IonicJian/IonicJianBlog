package handler

import (
	"github.com/gin-gonic/gin"
	resp "github.com/zanelin/blog/internal/pkg/response"
)

type GuestbookHandler struct{}

func NewGuestbookHandler() *GuestbookHandler {
	return &GuestbookHandler{}
}

func (h *GuestbookHandler) List(c *gin.Context)   { resp.Success(c, nil) }
func (h *GuestbookHandler) Create(c *gin.Context) { resp.Success(c, nil) }
func (h *GuestbookHandler) Delete(c *gin.Context) { resp.Success(c, nil) }
