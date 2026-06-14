package content

import (
	"strconv"

	"github.com/gin-gonic/gin"
	resp "github.com/zanelin/blog/internal/pkg/response"
	contentSvc "github.com/zanelin/blog/internal/service/content"
)

type CategoryHandler struct {
	service contentSvc.CategoryService
}

func NewCategoryHandler(s contentSvc.CategoryService) *CategoryHandler { return &CategoryHandler{service: s} }

func (h *CategoryHandler) List(c *gin.Context) {
	cats, err := h.service.List(c.Request.Context())
	if err != nil { resp.InternalError(c, err.Error()); return }
	resp.Success(c, cats)
}

func (h *CategoryHandler) Create(c *gin.Context) {
	var req struct {
		Name        string `json:"name" binding:"required"`
		Description string `json:"description"`
		SortOrder   int    `json:"sort_order"`
		ParentID    *int64 `json:"parent_id"`
	}
	if err := c.ShouldBindJSON(&req); err != nil { resp.BadRequest(c, err.Error()); return }
	cat, err := h.service.Create(c.Request.Context(), req.Name, req.Description, req.SortOrder, req.ParentID)
	if err != nil { resp.InternalError(c, err.Error()); return }
	resp.Success(c, cat)
}

func (h *CategoryHandler) Update(c *gin.Context) {
	id, _ := strconv.ParseInt(c.Param("id"), 10, 64)
	var req struct {
		Name        string `json:"name"`
		Description string `json:"description"`
		SortOrder   int    `json:"sort_order"`
		ParentID    *int64 `json:"parent_id"`
	}
	if err := c.ShouldBindJSON(&req); err != nil { resp.BadRequest(c, err.Error()); return }
	cat, err := h.service.Update(c.Request.Context(), id, req.Name, req.Description, req.SortOrder, req.ParentID)
	if err != nil { resp.InternalError(c, err.Error()); return }
	resp.Success(c, cat)
}

func (h *CategoryHandler) Delete(c *gin.Context) {
	id, _ := strconv.ParseInt(c.Param("id"), 10, 64)
	if err := h.service.Delete(c.Request.Context(), id); err != nil { resp.InternalError(c, err.Error()); return }
	resp.Success(c, nil)
}
