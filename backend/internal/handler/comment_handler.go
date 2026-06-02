package handler

import (
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/zanelin/blog/internal/dto/request"
	dto "github.com/zanelin/blog/internal/dto/response"
	"github.com/zanelin/blog/internal/middleware"
	"github.com/zanelin/blog/internal/model"
	"github.com/zanelin/blog/internal/pkg/pagination"
	resp "github.com/zanelin/blog/internal/pkg/response"
	"github.com/zanelin/blog/internal/service"
)

type CommentHandler struct {
	commentService service.CommentService
}

func NewCommentHandler(commentService service.CommentService) *CommentHandler {
	return &CommentHandler{commentService: commentService}
}

func (h *CommentHandler) List(c *gin.Context) {
	blogID, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		resp.BadRequest(c, "invalid blog id")
		return
	}

	p := pagination.Parse(c)
	comments, total, err := h.commentService.List(c.Request.Context(), blogID, p.Page, p.PageSize)
	if err != nil {
		resp.InternalError(c, err.Error())
		return
	}

	var items []*dto.CommentResponse
	for _, c := range comments {
		items = append(items, toCommentResponse(c))
	}
	if items == nil {
		items = []*dto.CommentResponse{}
	}

	resp.Paginated(c, resp.PaginatedData{
		Items:      items,
		Total:      total,
		Page:       p.Page,
		PageSize:   p.PageSize,
		TotalPages: pagination.TotalPages(total, p.PageSize),
	})
}

func (h *CommentHandler) Create(c *gin.Context) {
	blogID, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		resp.BadRequest(c, "invalid blog id")
		return
	}

	var req request.CreateCommentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		resp.BadRequest(c, err.Error())
		return
	}

	userID := c.GetInt64(middleware.ContextKeyUserID)

	comment, err := h.commentService.Create(c.Request.Context(), blogID, userID, service.CreateCommentParams{
		Content:     req.Content,
		ParentID:    req.ParentID,
		AnchorStart: req.AnchorStart,
		AnchorEnd:   req.AnchorEnd,
		AnchorText:  req.AnchorText,
	})
	if err != nil {
		resp.InternalError(c, err.Error())
		return
	}

	resp.Success(c, toCommentResponse(comment))
}

func (h *CommentHandler) Delete(c *gin.Context) {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		resp.BadRequest(c, "invalid id")
		return
	}

	if err := h.commentService.Delete(c.Request.Context(), id); err != nil {
		resp.InternalError(c, err.Error())
		return
	}
	resp.Success(c, nil)
}

func toCommentResponse(c *model.Comment) *dto.CommentResponse {
	r := &dto.CommentResponse{
		ID:          c.ID,
		BlogID:      c.BlogID,
		UserID:      c.UserID,
		ParentID:    c.ParentID,
		Content:     c.Content,
		AnchorStart: c.AnchorStart,
		AnchorEnd:   c.AnchorEnd,
		AnchorText:  c.AnchorText,
		IsApproved:  c.IsApproved,
		CreatedAt:   c.CreatedAt,
		UpdatedAt:   c.UpdatedAt,
		LikeCount:   c.LikeCount,
	}
	if c.Author != nil {
		r.Author = &dto.UserResponse{
			ID:          c.Author.ID,
			Username:    c.Author.Username,
			DisplayName: c.Author.DisplayName,
			AvatarURL:   c.Author.AvatarURL,
		}
	}
	if c.Replies != nil {
		for _, reply := range c.Replies {
			r.Replies = append(r.Replies, toCommentResponse(reply))
		}
	}
	return r
}
