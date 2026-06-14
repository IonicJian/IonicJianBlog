package blog

import (
	"context"
	"errors"
	"fmt"
	"strings"
	"time"
	"unicode"

	"github.com/jackc/pgx/v5"
	blogRepo "github.com/zanelin/blog/internal/repository/blog"
	tagRepo "github.com/zanelin/blog/internal/repository/content"
	"github.com/zanelin/blog/internal/model"
	md "github.com/zanelin/blog/internal/pkg/markdown"
	"github.com/zanelin/blog/internal/pkg/slug"
)

type Service interface {
	Create(ctx context.Context, userID int64, params CreateParams) (*model.Blog, error)
	GetByID(ctx context.Context, id int64, currentUserID *int64) (*model.Blog, error)
	GetBySlug(ctx context.Context, slug string, currentUserID *int64) (*model.Blog, error)
	Update(ctx context.Context, id int64, params UpdateParams) (*model.Blog, error)
	Delete(ctx context.Context, id int64) error
	List(ctx context.Context, opts blogRepo.ListOptions) ([]*model.Blog, int64, error)
	Search(ctx context.Context, query string, page, pageSize int, currentUserID *int64) ([]*model.Blog, int64, error)
	GetTop(ctx context.Context, limit int) ([]*model.Blog, error)
	IncrementView(ctx context.Context, id int64) error
}

type CreateParams struct {
	Title      string
	Content    string
	CoverImage string
	Status     string
	TagIDs     []int64
	CategoryID *int64
	IsTop      bool
}

type UpdateParams struct {
	Title      *string
	Content    *string
	CoverImage *string
	Status     *string
	TagIDs     []int64
	CategoryID *int64
	IsTop      *bool
}

type blogService struct {
	blogRepo blogRepo.Repository
	tagRepo  tagRepo.TagRepository
}

func New(blogRepo blogRepo.Repository, tagRepo tagRepo.TagRepository) Service {
	return &blogService{blogRepo: blogRepo, tagRepo: tagRepo}
}

func (s *blogService) Create(ctx context.Context, userID int64, params CreateParams) (*model.Blog, error) {
	blogSlug := slug.Generate(params.Title)
	if exists, _ := s.blogRepo.SlugExists(ctx, blogSlug, 0); exists {
		blogSlug = fmt.Sprintf("%s-%d", blogSlug, time.Now().UnixNano())
	}

	contentHTML := md.ToHTML(params.Content)
	excerpt := generateExcerpt(params.Content)

	blog := &model.Blog{
		UserID:      userID,
		Title:       params.Title,
		Slug:        blogSlug,
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

func (s *blogService) Update(ctx context.Context, id int64, params UpdateParams) (*model.Blog, error) {
	blog, err := s.blogRepo.GetByID(ctx, id, nil)
	if err != nil {
		return nil, err
	}

	if params.Title != nil {
		blog.Title = *params.Title
		blog.Slug = slug.Generate(blog.Title)
		if exists, _ := s.blogRepo.SlugExists(ctx, blog.Slug, id); exists {
			blog.Slug = fmt.Sprintf("%s-%d", blog.Slug, time.Now().UnixNano())
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

func (s *blogService) List(ctx context.Context, opts blogRepo.ListOptions) ([]*model.Blog, int64, error) {
	blogs, total, err := s.blogRepo.List(ctx, opts)
	if err != nil {
		return nil, 0, err
	}
	for _, b := range blogs {
		b.Tags, _ = s.tagRepo.GetByBlogID(ctx, b.ID)
	}
	return blogs, total, nil
}

func (s *blogService) Search(ctx context.Context, query string, page, pageSize int, currentUserID *int64) ([]*model.Blog, int64, error) {
	return s.blogRepo.Search(ctx, query, page, pageSize, currentUserID)
}

func (s *blogService) GetTop(ctx context.Context, limit int) ([]*model.Blog, error) {
	return s.blogRepo.GetTop(ctx, limit)
}

func generateExcerpt(content string) string {
	excerpt := content
	if len(excerpt) > 200 {
		excerpt = excerpt[:200]
	}
	if idx := strings.LastIndexAny(excerpt, " .。，,!！?？\n"); idx > 0 {
		excerpt = excerpt[:idx]
	}
	excerpt = strings.Map(func(r rune) rune {
		if unicode.IsControl(r) {
			return ' '
		}
		return r
	}, excerpt)
	return strings.TrimSpace(excerpt)
}
