package blog

import (
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/rs/zerolog/log"
	"github.com/zanelin/blog/internal/dto/mapper"
	"github.com/zanelin/blog/internal/dto/request"
	dto "github.com/zanelin/blog/internal/dto/response"
	"github.com/zanelin/blog/internal/middleware"
	"github.com/zanelin/blog/internal/pkg/pagination"
	resp "github.com/zanelin/blog/internal/pkg/response"
	blogRepo "github.com/zanelin/blog/internal/repository/blog"
	blogSvc "github.com/zanelin/blog/internal/service/blog"
)

type Handler struct {
	blogService blogSvc.Service
}

func New(blogService blogSvc.Service) *Handler { return &Handler{blogService: blogService} }

func (h *Handler) List(c *gin.Context) {
	p := pagination.Parse(c)
	status := c.DefaultQuery("status", "published")
	if getRole(c) != "admin" {
		status = "published"
	}
	sort := c.DefaultQuery("sort", "latest")
	opts := blogRepo.ListOptions{
		Page: p.Page, PageSize: p.PageSize, Status: status,
		TagSlug: c.Query("tag"), CategorySlug: c.Query("category"),
		Sort: sort,
	}
	blogs, total, err := h.blogService.List(c.Request.Context(), opts)
	if err != nil { resp.InternalError(c, err.Error()); return }
	var items []dto.BlogListResponse
	for _, b := range blogs { items = append(items, mapper.BlogToListResponse(b)) }
	resp.Paginated(c, resp.PaginatedData{Items: items, Total: total, Page: p.Page, PageSize: p.PageSize, TotalPages: pagination.TotalPages(total, p.PageSize)})
}

func (h *Handler) Search(c *gin.Context) {
	p := pagination.Parse(c)
	query := c.Query("q")
	if query == "" { resp.BadRequest(c, "search query required"); return }
	currentUserID := getOptionalUserID(c)
	blogs, total, err := h.blogService.Search(c.Request.Context(), query, p.Page, p.PageSize, currentUserID)
	if err != nil { resp.InternalError(c, err.Error()); return }
	var items []dto.BlogListResponse
	for _, b := range blogs { items = append(items, mapper.BlogToListResponse(b)) }
	resp.Paginated(c, resp.PaginatedData{Items: items, Total: total, Page: p.Page, PageSize: p.PageSize, TotalPages: pagination.TotalPages(total, p.PageSize)})
}

func (h *Handler) GetTop(c *gin.Context) {
	blogs, err := h.blogService.GetTop(c.Request.Context(), 10)
	if err != nil { resp.InternalError(c, err.Error()); return }
	var items []dto.BlogListResponse
	for _, b := range blogs { items = append(items, mapper.BlogToListResponse(b)) }
	resp.Success(c, items)
}

func (h *Handler) GetByID(c *gin.Context) {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil { resp.BadRequest(c, "invalid id"); return }
	currentUserID := getOptionalUserID(c)
	blog, err := h.blogService.GetByID(c.Request.Context(), id, currentUserID, getRole(c))
	if err != nil { resp.NotFound(c, "blog not found"); return }
	resp.Success(c, mapper.BlogToDetailResponse(blog))
}

func (h *Handler) GetBySlug(c *gin.Context) {
	slug := c.Param("slug")
	currentUserID := getOptionalUserID(c)
	blog, err := h.blogService.GetBySlug(c.Request.Context(), slug, currentUserID, getRole(c))
	if err != nil { resp.NotFound(c, "blog not found"); return }
	resp.Success(c, mapper.BlogToDetailResponse(blog))
}

func (h *Handler) Create(c *gin.Context) {
	var req request.CreateBlogRequest
	if err := c.ShouldBindJSON(&req); err != nil { resp.BadRequest(c, err.Error()); return }
	userID := c.GetInt64(middleware.ContextKeyUserID)
	blog, err := h.blogService.Create(c.Request.Context(), userID, blogSvc.CreateParams{
		Title: req.Title, Content: req.Content, CoverImage: req.CoverImage,
		Status: req.Status, TagIDs: req.TagIDs, CategoryID: req.CategoryID, IsTop: req.IsTop,
	})
	if err != nil { resp.InternalError(c, err.Error()); return }
	resp.Success(c, mapper.BlogToDetailResponse(blog))
}

func (h *Handler) Update(c *gin.Context) {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil { resp.BadRequest(c, "invalid id"); return }
	var req request.UpdateBlogRequest
	if err := c.ShouldBindJSON(&req); err != nil { resp.BadRequest(c, err.Error()); return }
	params := blogSvc.UpdateParams{TagIDs: req.TagIDs}
	if req.Title != "" { params.Title = &req.Title }
	if req.Content != "" { params.Content = &req.Content }
	if req.CoverImage != "" { params.CoverImage = &req.CoverImage }
	if req.Status != "" { params.Status = &req.Status }
	if req.IsTop != nil { params.IsTop = req.IsTop }
	params.CategoryID = req.CategoryID
	blog, err := h.blogService.Update(c.Request.Context(), id, params)
	if err != nil { resp.InternalError(c, err.Error()); return }
	resp.Success(c, mapper.BlogToDetailResponse(blog))
}

func (h *Handler) IncrementView(c *gin.Context) {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil { resp.BadRequest(c, "invalid id"); return }
	if err := h.blogService.IncrementView(c.Request.Context(), id); err != nil {
			log.Error().Err(err).Int64("blog_id", id).Msg("increment view failed")
		}
	resp.Success(c, nil)
}

func (h *Handler) Delete(c *gin.Context) {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil { resp.BadRequest(c, "invalid id"); return }
	if err := h.blogService.Delete(c.Request.Context(), id); err != nil { resp.InternalError(c, err.Error()); return }
	resp.Success(c, nil)
}

func getOptionalUserID(c *gin.Context) *int64 {
	if uid, exists := c.Get(middleware.ContextKeyUserID); exists {
		id := uid.(int64)
		return &id
	}
	return nil
}

func getRole(c *gin.Context) string {
	if role, exists := c.Get(middleware.ContextKeyRole); exists {
		if r, ok := role.(string); ok {
			return r
		}
	}
	return ""
}

func (h *Handler) GenerateSummary(c *gin.Context) {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		resp.BadRequest(c, "invalid id")
		return
	}
	summary, err := h.blogService.GenerateSummary(c.Request.Context(), id)
	if err != nil {
		resp.InternalError(c, err.Error())
		return
	}
	resp.Success(c, summary)
}

func (h *Handler) GetSummary(c *gin.Context) {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		resp.BadRequest(c, "invalid id")
		return
	}
	currentUserID := getOptionalUserID(c)
	summary, err := h.blogService.GetSummary(c.Request.Context(), id, currentUserID, getRole(c))
	if err != nil {
		resp.NotFound(c, "blog not found")
		return
	}
	resp.Success(c, summary)
}
