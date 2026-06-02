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
	"github.com/zanelin/blog/internal/repository"
	"github.com/zanelin/blog/internal/service"
)

type BlogHandler struct {
	blogService service.BlogService
}

func NewBlogHandler(blogService service.BlogService) *BlogHandler {
	return &BlogHandler{blogService: blogService}
}

func (h *BlogHandler) List(c *gin.Context) {
	p := pagination.Parse(c)
	status := c.DefaultQuery("status", "published")

	opts := repository.ListOptions{
		Page:     p.Page,
		PageSize: p.PageSize,
		Status:   status,
	}

	blogs, total, err := h.blogService.List(c.Request.Context(), opts)
	if err != nil {
		resp.InternalError(c, err.Error())
		return
	}

	var items []dto.BlogListResponse
	for _, b := range blogs {
		items = append(items, toBlogListResponse(b))
	}

	resp.Paginated(c, resp.PaginatedData{
		Items:      items,
		Total:      total,
		Page:       p.Page,
		PageSize:   p.PageSize,
		TotalPages: pagination.TotalPages(total, p.PageSize),
	})
}

func (h *BlogHandler) Search(c *gin.Context) {
	p := pagination.Parse(c)
	query := c.Query("q")
	if query == "" {
		resp.BadRequest(c, "search query required")
		return
	}

	blogs, total, err := h.blogService.Search(c.Request.Context(), query, p.Page, p.PageSize)
	if err != nil {
		resp.InternalError(c, err.Error())
		return
	}

	var items []dto.BlogListResponse
	for _, b := range blogs {
		items = append(items, toBlogListResponse(b))
	}

	resp.Paginated(c, resp.PaginatedData{
		Items:      items,
		Total:      total,
		Page:       p.Page,
		PageSize:   p.PageSize,
		TotalPages: pagination.TotalPages(total, p.PageSize),
	})
}

func (h *BlogHandler) GetTop(c *gin.Context) {
	// Query for pinned blogs
	opts := repository.ListOptions{
		Page:     1,
		PageSize: 5,
		Status:   "published",
	}
	blogs, _, err := h.blogService.List(c.Request.Context(), opts)
	if err != nil {
		resp.InternalError(c, err.Error())
		return
	}

	var items []dto.BlogListResponse
	for _, b := range blogs {
		if b.IsTop {
			items = append(items, toBlogListResponse(b))
		}
	}

	resp.Success(c, items)
}

func (h *BlogHandler) GetByID(c *gin.Context) {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		resp.BadRequest(c, "invalid id")
		return
	}

	currentUserID := getOptionalUserID(c)
	blog, err := h.blogService.GetByID(c.Request.Context(), id, currentUserID)
	if err != nil {
		resp.NotFound(c, "blog not found")
		return
	}

	resp.Success(c, toBlogDetailResponse(blog))
}

func (h *BlogHandler) GetBySlug(c *gin.Context) {
	slug := c.Param("slug")
	currentUserID := getOptionalUserID(c)
	blog, err := h.blogService.GetBySlug(c.Request.Context(), slug, currentUserID)
	if err != nil {
		resp.NotFound(c, "blog not found")
		return
	}
	resp.Success(c, toBlogDetailResponse(blog))
}

func (h *BlogHandler) Create(c *gin.Context) {
	var req request.CreateBlogRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		resp.BadRequest(c, err.Error())
		return
	}

	userID := c.GetInt64(middleware.ContextKeyUserID)

	blog, err := h.blogService.Create(c.Request.Context(), userID, service.CreateBlogParams{
		Title:      req.Title,
		Content:    req.Content,
		CoverImage: req.CoverImage,
		Status:     req.Status,
		TagIDs:     req.TagIDs,
		IsTop:      req.IsTop,
	})
	if err != nil {
		resp.InternalError(c, err.Error())
		return
	}

	resp.Success(c, toBlogDetailResponse(blog))
}

func (h *BlogHandler) Update(c *gin.Context) {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		resp.BadRequest(c, "invalid id")
		return
	}

	var req request.UpdateBlogRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		resp.BadRequest(c, err.Error())
		return
	}

	params := service.UpdateBlogParams{
		TagIDs: req.TagIDs,
	}
	if req.Title != "" {
		params.Title = &req.Title
	}
	if req.Content != "" {
		params.Content = &req.Content
	}
	if req.CoverImage != "" {
		params.CoverImage = &req.CoverImage
	}
	if req.Status != "" {
		params.Status = &req.Status
	}
	if req.IsTop != nil {
		params.IsTop = req.IsTop
	}

	blog, err := h.blogService.Update(c.Request.Context(), id, params)
	if err != nil {
		resp.InternalError(c, err.Error())
		return
	}

	resp.Success(c, toBlogDetailResponse(blog))
}

func (h *BlogHandler) IncrementView(c *gin.Context) {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		resp.BadRequest(c, "invalid id")
		return
	}
	_ = h.blogService.IncrementView(c.Request.Context(), id)
	resp.Success(c, nil)
}

func (h *BlogHandler) Delete(c *gin.Context) {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		resp.BadRequest(c, "invalid id")
		return
	}

	if err := h.blogService.Delete(c.Request.Context(), id); err != nil {
		resp.InternalError(c, err.Error())
		return
	}

	resp.Success(c, nil)
}

func getOptionalUserID(c *gin.Context) *int64 {
	if uid, exists := c.Get(middleware.ContextKeyUserID); exists {
		id := uid.(int64)
		return &id
	}
	return nil
}

func toBlogListResponse(b *model.Blog) dto.BlogListResponse {
	r := dto.BlogListResponse{
		ID:         b.ID,
		Title:      b.Title,
		Slug:       b.Slug,
		Excerpt:    b.Excerpt,
		CoverImage: b.CoverImage,
		Status:     b.Status,
		ViewCount:  b.ViewCount,
		IsTop:      b.IsTop,
		CreatedAt:  b.CreatedAt,
		UpdatedAt:  b.UpdatedAt,
		LikeCount:  b.LikeCount,
	}
	if b.Tags != nil {
		for _, t := range b.Tags {
			r.Tags = append(r.Tags, &dto.TagResponse{
				ID:    t.ID,
				Name:  t.Name,
				Slug:  t.Slug,
				Color: t.Color,
			})
		}
	}
	return r
}

func toBlogDetailResponse(b *model.Blog) dto.BlogResponse {
	r := dto.BlogResponse{
		ID:          b.ID,
		UserID:      b.UserID,
		Title:       b.Title,
		Slug:        b.Slug,
		Content:     b.Content,
		ContentHTML: b.ContentHTML,
		Excerpt:     b.Excerpt,
		CoverImage:  b.CoverImage,
		Status:      b.Status,
		ViewCount:   b.ViewCount,
		IsTop:       b.IsTop,
		CreatedAt:   b.CreatedAt,
		UpdatedAt:   b.UpdatedAt,
		LikeCount:   b.LikeCount,
		LikedByMe:   b.LikedByMe,
	}
	if b.Tags != nil {
		for _, t := range b.Tags {
			r.Tags = append(r.Tags, &dto.TagResponse{
				ID:    t.ID,
				Name:  t.Name,
				Slug:  t.Slug,
				Color: t.Color,
			})
		}
	}
	return r
}
