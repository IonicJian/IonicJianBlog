package social

import (
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/zanelin/blog/internal/dto/request"
	"github.com/zanelin/blog/internal/dto/mapper"
	dto "github.com/zanelin/blog/internal/dto/response"
	"github.com/zanelin/blog/internal/middleware"
	"github.com/zanelin/blog/internal/pkg/pagination"
	resp "github.com/zanelin/blog/internal/pkg/response"
	socialSvc "github.com/zanelin/blog/internal/service/social"
)

type CommentHandler struct {
	service socialSvc.CommentService
}

func NewCommentHandler(s socialSvc.CommentService) *CommentHandler { return &CommentHandler{service: s} }

func (h *CommentHandler) List(c *gin.Context) {
	blogID, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil { resp.BadRequest(c, "invalid blog id"); return }
	p := pagination.Parse(c)
	comments, total, err := h.service.List(c.Request.Context(), blogID, p.Page, p.PageSize)
	if err != nil { resp.InternalError(c, err.Error()); return }
	var items []*dto.CommentResponse
	for _, c := range comments { items = append(items, mapper.CommentToResponse(c)) }
	if items == nil { items = []*dto.CommentResponse{} }
	resp.Paginated(c, resp.PaginatedData{
		Items: items, Total: total, Page: p.Page, PageSize: p.PageSize,
		TotalPages: pagination.TotalPages(total, p.PageSize),
	})
}

func (h *CommentHandler) ListAll(c *gin.Context) {
	p := pagination.Parse(c)
	comments, total, err := h.service.ListAll(c.Request.Context(), p.Page, p.PageSize)
	if err != nil {
		resp.InternalError(c, err.Error())
		return
	}
	items := make([]*dto.CommentResponse, 0, len(comments))
	for _, cm := range comments {
		items = append(items, mapper.CommentToResponse(cm))
	}
	resp.Paginated(c, resp.PaginatedData{
		Items: items, Total: total, Page: p.Page, PageSize: p.PageSize,
		TotalPages: pagination.TotalPages(total, p.PageSize),
	})
}

func (h *CommentHandler) Create(c *gin.Context) {
	blogID, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil { resp.BadRequest(c, "invalid blog id"); return }
	var req request.CreateCommentRequest
	if err := c.ShouldBindJSON(&req); err != nil { resp.BadRequest(c, err.Error()); return }
	userID := c.GetInt64(middleware.ContextKeyUserID)
	comment, err := h.service.Create(c.Request.Context(), blogID, userID, socialSvc.CreateCommentParams{
		Content: req.Content, ParentID: req.ParentID,
		AnchorStart: req.AnchorStart, AnchorEnd: req.AnchorEnd, AnchorText: req.AnchorText,
	})
	if err != nil { resp.InternalError(c, err.Error()); return }
	resp.Success(c, mapper.CommentToResponse(comment))
}

func (h *CommentHandler) Delete(c *gin.Context) {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil { resp.BadRequest(c, "invalid id"); return }
	userID := c.GetInt64(middleware.ContextKeyUserID)
	role, _ := c.Get(middleware.ContextKeyRole)
	comment, err := h.service.GetByID(c.Request.Context(), id)
	if err != nil { resp.NotFound(c, "comment not found"); return }
	if comment.UserID != userID && role != "admin" {
		resp.Forbidden(c, "you can only delete your own comments")
		return
	}
	if err := h.service.Delete(c.Request.Context(), id); err != nil { resp.InternalError(c, err.Error()); return }
	resp.Success(c, nil)
}
