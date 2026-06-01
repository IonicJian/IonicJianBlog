package handler

import (
	"github.com/gin-gonic/gin"
	resp "github.com/zanelin/blog/internal/pkg/response"
)

type FriendLinkHandler struct{}

func NewFriendLinkHandler() *FriendLinkHandler {
	return &FriendLinkHandler{}
}

func (h *FriendLinkHandler) List(c *gin.Context)   { resp.Success(c, nil) }
func (h *FriendLinkHandler) Create(c *gin.Context) { resp.Success(c, nil) }
func (h *FriendLinkHandler) Update(c *gin.Context) { resp.Success(c, nil) }
func (h *FriendLinkHandler) Delete(c *gin.Context) { resp.Success(c, nil) }
