package content

import (
	"strconv"

	"github.com/gin-gonic/gin"
	resp "github.com/zanelin/blog/internal/pkg/response"
	contentSvc "github.com/zanelin/blog/internal/service/content"
)

type FriendLinkHandler struct {
	service contentSvc.FriendLinkService
}

func NewFriendLinkHandler(s contentSvc.FriendLinkService) *FriendLinkHandler { return &FriendLinkHandler{service: s} }

func (h *FriendLinkHandler) List(c *gin.Context) {
	links, err := h.service.List(c.Request.Context())
	if err != nil { resp.InternalError(c, err.Error()); return }
	resp.Success(c, links)
}

func (h *FriendLinkHandler) Create(c *gin.Context) {
	var req struct {
		Name        string `json:"name" binding:"required"`
		URL         string `json:"url" binding:"required"`
		Description string `json:"description"`
		LogoURL     string `json:"logo_url"`
		SortOrder   int    `json:"sort_order"`
	}
	if err := c.ShouldBindJSON(&req); err != nil { resp.BadRequest(c, err.Error()); return }
	link, err := h.service.Create(c.Request.Context(), req.Name, req.URL, req.Description, req.LogoURL, req.SortOrder)
	if err != nil { resp.InternalError(c, err.Error()); return }
	resp.Success(c, link)
}

func (h *FriendLinkHandler) Update(c *gin.Context) {
	id, _ := strconv.ParseInt(c.Param("id"), 10, 64)
	var req struct {
		Name        string `json:"name"`
		URL         string `json:"url"`
		Description string `json:"description"`
		LogoURL     string `json:"logo_url"`
		SortOrder   int    `json:"sort_order"`
		IsActive    *bool  `json:"is_active"`
	}
	if err := c.ShouldBindJSON(&req); err != nil { resp.BadRequest(c, err.Error()); return }
	link, err := h.service.Update(c.Request.Context(), id, req.Name, req.URL, req.Description, req.LogoURL, req.SortOrder, req.IsActive)
	if err != nil { resp.InternalError(c, err.Error()); return }
	resp.Success(c, link)
}

func (h *FriendLinkHandler) Delete(c *gin.Context) {
	id, _ := strconv.ParseInt(c.Param("id"), 10, 64)
	if err := h.service.Delete(c.Request.Context(), id); err != nil { resp.InternalError(c, err.Error()); return }
	resp.Success(c, nil)
}
