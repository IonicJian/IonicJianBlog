package handler

import (
	"strconv"

	"github.com/gin-gonic/gin"
	dto "github.com/zanelin/blog/internal/dto/response"
	resp "github.com/zanelin/blog/internal/pkg/response"
	"github.com/zanelin/blog/internal/service"
)

type TagHandler struct {
	tagService service.TagService
}

func NewTagHandler(tagService service.TagService) *TagHandler {
	return &TagHandler{tagService: tagService}
}

func (h *TagHandler) List(c *gin.Context) {
	tags, err := h.tagService.List(c.Request.Context())
	if err != nil {
		resp.InternalError(c, err.Error())
		return
	}

	var items []*dto.TagResponse
	for _, t := range tags {
		items = append(items, &dto.TagResponse{
			ID:        t.ID,
			Name:      t.Name,
			Slug:      t.Slug,
			Color:     t.Color,
			PostCount: t.PostCount,
			CreatedAt: t.CreatedAt,
		})
	}
	if items == nil {
		items = []*dto.TagResponse{}
	}
	resp.Success(c, items)
}

func (h *TagHandler) Create(c *gin.Context) {
	var req struct {
		Name  string `json:"name" binding:"required"`
		Color string `json:"color"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		resp.BadRequest(c, err.Error())
		return
	}

	tag, err := h.tagService.Create(c.Request.Context(), req.Name, req.Color)
	if err != nil {
		resp.InternalError(c, err.Error())
		return
	}

	resp.Success(c, &dto.TagResponse{
		ID:   tag.ID,
		Name: tag.Name,
		Slug: tag.Slug,
		Color: tag.Color,
	})
}

func (h *TagHandler) Update(c *gin.Context) {
	id, _ := strconv.ParseInt(c.Param("id"), 10, 64)
	var req struct {
		Name  string `json:"name"`
		Color string `json:"color"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		resp.BadRequest(c, err.Error())
		return
	}

	tag, err := h.tagService.Update(c.Request.Context(), id, req.Name, req.Color)
	if err != nil {
		resp.InternalError(c, err.Error())
		return
	}

	resp.Success(c, &dto.TagResponse{
		ID:   tag.ID,
		Name: tag.Name,
		Slug: tag.Slug,
		Color: tag.Color,
	})
}

func (h *TagHandler) Delete(c *gin.Context) {
	id, _ := strconv.ParseInt(c.Param("id"), 10, 64)
	if err := h.tagService.Delete(c.Request.Context(), id); err != nil {
		resp.InternalError(c, err.Error())
		return
	}
	resp.Success(c, nil)
}
