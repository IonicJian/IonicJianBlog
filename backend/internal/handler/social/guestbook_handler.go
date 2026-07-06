package social

import (
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/zanelin/blog/internal/middleware"
	"github.com/zanelin/blog/internal/pkg/pagination"
	resp "github.com/zanelin/blog/internal/pkg/response"
	socialSvc "github.com/zanelin/blog/internal/service/social"
)

type GuestbookHandler struct {
	service socialSvc.GuestbookService
}

func NewGuestbookHandler(s socialSvc.GuestbookService) *GuestbookHandler { return &GuestbookHandler{service: s} }

func (h *GuestbookHandler) List(c *gin.Context) {
	p := pagination.Parse(c)
	messages, total, err := h.service.List(c.Request.Context(), p.Page, p.PageSize)
	if err != nil { resp.InternalError(c, err.Error()); return }
	resp.Paginated(c, resp.PaginatedData{
		Items: messages, Total: total, Page: p.Page, PageSize: p.PageSize,
		TotalPages: pagination.TotalPages(total, p.PageSize),
	})
}

func (h *GuestbookHandler) Create(c *gin.Context) {
	var req struct {
		Nickname string `json:"nickname" binding:"max=128"`
		Content  string `json:"content" binding:"required,min=1,max=2000"`
	}
	if err := c.ShouldBindJSON(&req); err != nil { resp.BadRequest(c, err.Error()); return }
	var userID *int64
	if uid, exists := c.Get(middleware.ContextKeyUserID); exists {
		id := uid.(int64)
		userID = &id
	}
	msg, err := h.service.Create(c.Request.Context(), userID, req.Nickname, req.Content)
	if err != nil { resp.InternalError(c, err.Error()); return }
	resp.Success(c, msg)
}

func (h *GuestbookHandler) Delete(c *gin.Context) {
	id, _ := strconv.ParseInt(c.Param("id"), 10, 64)
	userID, _ := c.Get(middleware.ContextKeyUserID)
	role, _ := c.Get(middleware.ContextKeyRole)
	msg, err := h.service.GetByID(c.Request.Context(), id)
	if err != nil { resp.NotFound(c, "message not found"); return }
	canDelete := role == "admin"
	if !canDelete && msg.UserID != nil {
		if uid, ok := userID.(int64); ok { canDelete = *msg.UserID == uid }
	}
	if !canDelete { resp.Forbidden(c, "you can only delete your own messages"); return }
	if err := h.service.Delete(c.Request.Context(), id); err != nil { resp.InternalError(c, err.Error()); return }
	resp.Success(c, nil)
}
