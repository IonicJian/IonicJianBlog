package content

import (
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/zanelin/blog/internal/dto/mapper"
	dto "github.com/zanelin/blog/internal/dto/response"
	resp "github.com/zanelin/blog/internal/pkg/response"
	contentSvc "github.com/zanelin/blog/internal/service/content"
)

type TagHandler struct {
	service contentSvc.TagService
}

func NewTagHandler(s contentSvc.TagService) *TagHandler { return &TagHandler{service: s} }

func (h *TagHandler) List(c *gin.Context) {
	tags, err := h.service.List(c.Request.Context())
	if err != nil { resp.InternalError(c, err.Error()); return }
	var items []*dto.TagResponse
	for _, t := range tags { items = append(items, mapper.TagToResponse(t)) }
	if items == nil { items = []*dto.TagResponse{} }
	resp.Success(c, items)
}

func (h *TagHandler) Create(c *gin.Context) {
	var req struct {
		Name  string `json:"name" binding:"required"`
		Color string `json:"color"`
	}
	if err := c.ShouldBindJSON(&req); err != nil { resp.BadRequest(c, err.Error()); return }
	tag, err := h.service.Create(c.Request.Context(), req.Name, req.Color)
	if err != nil { resp.InternalError(c, err.Error()); return }
	resp.Success(c, mapper.TagToResponse(tag))
}

func (h *TagHandler) Update(c *gin.Context) {
	id, _ := strconv.ParseInt(c.Param("id"), 10, 64)
	var req struct {
		Name  string `json:"name"`
		Color string `json:"color"`
	}
	if err := c.ShouldBindJSON(&req); err != nil { resp.BadRequest(c, err.Error()); return }
	tag, err := h.service.Update(c.Request.Context(), id, req.Name, req.Color)
	if err != nil { resp.InternalError(c, err.Error()); return }
	resp.Success(c, mapper.TagToResponse(tag))
}

func (h *TagHandler) Delete(c *gin.Context) {
	id, _ := strconv.ParseInt(c.Param("id"), 10, 64)
	if err := h.service.Delete(c.Request.Context(), id); err != nil { resp.InternalError(c, err.Error()); return }
	resp.Success(c, nil)
}
