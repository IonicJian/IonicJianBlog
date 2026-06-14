package user

import (
	"github.com/gin-gonic/gin"
	resp "github.com/zanelin/blog/internal/pkg/response"
)

type Handler struct{}

func New() *Handler { return &Handler{} }

func (h *Handler) GetUser(c *gin.Context) {
	resp.Success(c, nil) // reserved for future implementation
}
