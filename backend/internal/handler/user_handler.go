package handler

import (
	"github.com/gin-gonic/gin"
	resp "github.com/zanelin/blog/internal/pkg/response"
)

type UserHandler struct{}

func NewUserHandler() *UserHandler {
	return &UserHandler{}
}

func (h *UserHandler) GetUser(c *gin.Context) {
	resp.Success(c, nil) // TODO: Phase 4
}
