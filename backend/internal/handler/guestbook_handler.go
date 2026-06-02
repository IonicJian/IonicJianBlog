package handler

import (
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/zanelin/blog/internal/middleware"
	"github.com/zanelin/blog/internal/pkg/pagination"
	resp "github.com/zanelin/blog/internal/pkg/response"
	"github.com/zanelin/blog/internal/service"
)

type GuestbookHandler struct {
	service service.GuestbookService
}

func NewGuestbookHandler(s service.GuestbookService) *GuestbookHandler {
	return &GuestbookHandler{service: s}
}

func (h *GuestbookHandler) List(c *gin.Context) {
	p := pagination.Parse(c)
	messages, total, err := h.service.List(c.Request.Context(), p.Page, p.PageSize)
	if err != nil {
		resp.InternalError(c, err.Error())
		return
	}
	resp.Paginated(c, resp.PaginatedData{
		Items:      messages,
		Total:      total,
		Page:       p.Page,
		PageSize:   p.PageSize,
		TotalPages: pagination.TotalPages(total, p.PageSize),
	})
}

func (h *GuestbookHandler) Create(c *gin.Context) {
	var req struct {
		Nickname string `json:"nickname"`
		Content  string `json:"content" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		resp.BadRequest(c, err.Error())
		return
	}

	var userID *int64
	if uid, exists := c.Get(middleware.ContextKeyUserID); exists {
		id := uid.(int64)
		userID = &id
	}

	msg, err := h.service.Create(c.Request.Context(), userID, req.Nickname, req.Content)
	if err != nil {
		resp.InternalError(c, err.Error())
		return
	}
	resp.Success(c, msg)
}

func (h *GuestbookHandler) Delete(c *gin.Context) {
	id, _ := strconv.ParseInt(c.Param("id"), 10, 64)
	if err := h.service.Delete(c.Request.Context(), id); err != nil {
		resp.InternalError(c, err.Error())
		return
	}
	resp.Success(c, nil)
}
