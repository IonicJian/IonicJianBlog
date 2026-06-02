package service

import (
	"context"
	"errors"
	"fmt"
	"regexp"
	"strings"
	"time"
	"unicode"

	"github.com/jackc/pgx/v5"
	md "github.com/zanelin/blog/internal/pkg/markdown"
	"github.com/zanelin/blog/internal/model"
	"github.com/zanelin/blog/internal/repository"
)

type BlogService interface {
	Create(ctx context.Context, userID int64, req CreateBlogParams) (*model.Blog, error)
	GetByID(ctx context.Context, id int64, currentUserID *int64) (*model.Blog, error)
	GetBySlug(ctx context.Context, slug string, currentUserID *int64) (*model.Blog, error)
	Update(ctx context.Context, id int64, req UpdateBlogParams) (*model.Blog, error)
	Delete(ctx context.Context, id int64) error
	List(ctx context.Context, opts repository.ListOptions) ([]*model.Blog, int64, error)
	Search(ctx context.Context, query string, page, pageSize int) ([]*model.Blog, int64, error)
	IncrementView(ctx context.Context, id int64) error
}

type CreateBlogParams struct {
	Title      string
	Content    string
	CoverImage string
	Status     string
	TagIDs     []int64
	IsTop      bool
}

type UpdateBlogParams struct {
	Title      *string
	Content    *string
	CoverImage *string
	Status     *string
	TagIDs     []int64
	IsTop      *bool
}

type blogService struct {
	blogRepo repository.BlogRepository
	tagRepo  repository.TagRepository
}

func NewBlogService(blogRepo repository.BlogRepository, tagRepo repository.TagRepository) BlogService {
	return &blogService{blogRepo: blogRepo, tagRepo: tagRepo}
}

func (s *blogService) Create(ctx context.Context, userID int64, params CreateBlogParams) (*model.Blog, error) {
	slug := generateSlug(params.Title)
	if exists, _ := s.blogRepo.SlugExists(ctx, slug, 0); exists {
		slug = fmt.Sprintf("%s-%d", slug, timeNow())
	}

	contentHTML := md.ToHTML(params.Content)
	excerpt := generateExcerpt(params.Content)

	blog := &model.Blog{
		UserID:      userID,
		Title:       params.Title,
		Slug:        slug,
		Content:     params.Content,
		ContentHTML: contentHTML,
		Excerpt:     excerpt,
		CoverImage:  params.CoverImage,
		Status:      params.Status,
		IsTop:       params.IsTop,
	}

	if err := s.blogRepo.Create(ctx, blog, params.TagIDs); err != nil {
		return nil, err
	}

	blog.Tags, _ = s.tagRepo.GetByBlogID(ctx, blog.ID)
	return blog, nil
}

func (s *blogService) GetByID(ctx context.Context, id int64, currentUserID *int64) (*model.Blog, error) {
	blog, err := s.blogRepo.GetByID(ctx, id, currentUserID)
	if err != nil {
		return nil, err
	}
	blog.Tags, _ = s.tagRepo.GetByBlogID(ctx, id)
	return blog, nil
}

func (s *blogService) GetBySlug(ctx context.Context, slug string, currentUserID *int64) (*model.Blog, error) {
	blog, err := s.blogRepo.GetBySlug(ctx, slug, currentUserID)
	if err != nil {
		return nil, err
	}
	blog.Tags, _ = s.tagRepo.GetByBlogID(ctx, blog.ID)
	return blog, nil
}

func (s *blogService) Update(ctx context.Context, id int64, params UpdateBlogParams) (*model.Blog, error) {
	blog, err := s.blogRepo.GetByID(ctx, id, nil)
	if err != nil {
		return nil, err
	}

	if params.Title != nil {
		blog.Title = *params.Title
		blog.Slug = generateSlug(blog.Title)
		if exists, _ := s.blogRepo.SlugExists(ctx, blog.Slug, id); exists {
			blog.Slug = fmt.Sprintf("%s-%d", blog.Slug, timeNow())
		}
	}
	if params.Content != nil {
		blog.Content = *params.Content
		blog.ContentHTML = md.ToHTML(blog.Content)
		blog.Excerpt = generateExcerpt(blog.Content)
	}
	if params.CoverImage != nil {
		blog.CoverImage = *params.CoverImage
	}
	if params.Status != nil {
		blog.Status = *params.Status
	}
	if params.IsTop != nil {
		blog.IsTop = *params.IsTop
	}

	if err := s.blogRepo.Update(ctx, blog, params.TagIDs); err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, err
		}
		return nil, err
	}

	blog.Tags, _ = s.tagRepo.GetByBlogID(ctx, blog.ID)
	return blog, nil
}

func (s *blogService) Delete(ctx context.Context, id int64) error {
	return s.blogRepo.Delete(ctx, id)
}

func (s *blogService) IncrementView(ctx context.Context, id int64) error {
	return s.blogRepo.IncrementViewCount(ctx, id)
}

func (s *blogService) List(ctx context.Context, opts repository.ListOptions) ([]*model.Blog, int64, error) {
	blogs, total, err := s.blogRepo.List(ctx, opts)
	if err != nil {
		return nil, 0, err
	}
	// Load tags for each blog
	for _, b := range blogs {
		b.Tags, _ = s.tagRepo.GetByBlogID(ctx, b.ID)
	}
	return blogs, total, nil
}

func (s *blogService) Search(ctx context.Context, query string, page, pageSize int) ([]*model.Blog, int64, error) {
	return s.blogRepo.Search(ctx, query, page, pageSize)
}

func generateSlug(title string) string {
	slug := strings.ToLower(title)
	re := regexp.MustCompile(`[^a-z0-9]+`)
	slug = re.ReplaceAllString(slug, "-")
	slug = strings.Trim(slug, "-")
	if slug == "" {
		slug = "untitled"
	}
	return slug
}

func generateExcerpt(content string) string {
	// Strip markdown-ish syntax and take first 200 chars
	excerpt := content
	if len(excerpt) > 200 {
		excerpt = excerpt[:200]
	}
	// Remove trailing broken words
	if idx := strings.LastIndexAny(excerpt, " .。，,!！?？\n"); idx > 0 {
		excerpt = excerpt[:idx]
	}
	// Strip markdown common chars
	re := regexp.MustCompile(`[#*_\->\[\]()\x60!]`)
	excerpt = re.ReplaceAllString(excerpt, "")
	excerpt = strings.Map(func(r rune) rune {
		if unicode.IsControl(r) {
			return ' '
		}
		return r
	}, excerpt)
	return strings.TrimSpace(excerpt)
}

func timeNow() int64 {
	return time.Now().UnixNano()
}
