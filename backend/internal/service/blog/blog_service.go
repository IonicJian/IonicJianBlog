package blog

import (
	"context"
	"errors"
	"fmt"
	"strings"
	"time"
	"unicode"

	"github.com/jackc/pgx/v5"
	"github.com/rs/zerolog/log"
	"github.com/zanelin/blog/internal/model"
	"github.com/zanelin/blog/internal/pkg/ai"
	md "github.com/zanelin/blog/internal/pkg/markdown"
	"github.com/zanelin/blog/internal/pkg/slug"
	blogRepo "github.com/zanelin/blog/internal/repository/blog"
	contentRepo "github.com/zanelin/blog/internal/repository/content"
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
	GenerateSummary(ctx context.Context, blogID int64) (*model.AISummary, error)
	GetSummary(ctx context.Context, blogID int64, currentUserID *int64) (*model.AISummary, error)
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
	blogRepo      blogRepo.Repository
	tagRepo       contentRepo.TagRepository
	aiSummaryRepo contentRepo.AISummaryRepository
	ai            *ai.Client
}

func New(blogRepo blogRepo.Repository, tagRepo contentRepo.TagRepository, aiSummaryRepo contentRepo.AISummaryRepository, aiClient *ai.Client) Service {
	return &blogService{blogRepo: blogRepo, tagRepo: tagRepo, aiSummaryRepo: aiSummaryRepo, ai: aiClient}
}

func (s *blogService) Create(ctx context.Context, userID int64, params CreateParams) (*model.Blog, error) {
	blogSlug := slug.Generate(params.Title)
	if exists, _ := s.blogRepo.SlugExists(ctx, blogSlug, 0); exists {
		blogSlug = fmt.Sprintf("%s-%d", blogSlug, time.Now().UnixNano())
	}

	contentHTML := md.ToHTML(params.Content)
	excerpt := s.generateAIExcerpt(ctx, params.Content)

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

	// Auto-generate summary asynchronously on publish.
	go func() {
		ctx, cancel := context.WithTimeout(context.Background(), 60*time.Second)
		defer cancel()
		if _, err := s.GenerateSummary(ctx, blog.ID); err != nil {
			log.Warn().Err(err).Int64("blog_id", blog.ID).Msg("auto-generate summary failed")
		}
	}()

	return blog, nil
}

func (s *blogService) GetByID(ctx context.Context, id int64, currentUserID *int64) (*model.Blog, error) {
	blog, err := s.blogRepo.GetByID(ctx, id, currentUserID)
	if err != nil {
		return nil, err
	}
	blog.Tags, _ = s.tagRepo.GetByBlogID(ctx, id)
	s.attachAISummary(ctx, blog)
	return blog, nil
}

func (s *blogService) GetBySlug(ctx context.Context, slug string, currentUserID *int64) (*model.Blog, error) {
	blog, err := s.blogRepo.GetBySlug(ctx, slug, currentUserID)
	if err != nil {
		return nil, err
	}
	blog.Tags, _ = s.tagRepo.GetByBlogID(ctx, blog.ID)
	s.attachAISummary(ctx, blog)
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
		blog.Excerpt = s.generateAIExcerpt(ctx, blog.Content)
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

	if params.Content != nil {
		go func() {
			ctx, cancel := context.WithTimeout(context.Background(), 60*time.Second)
			defer cancel()
			if _, err := s.GenerateSummary(ctx, blog.ID); err != nil {
				log.Warn().Err(err).Int64("blog_id", blog.ID).Msg("auto-generate summary failed")
			}
		}()
	}

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

// --- AI summary ---

// generateAIExcerpt calls AI to produce a one-line excerpt; on any failure it
// falls back to the deterministic truncate-based excerpt.
func (s *blogService) generateAIExcerpt(ctx context.Context, content string) string {
	if s.ai == nil || !s.ai.Available() {
		return generateExcerpt(content)
	}
	input := truncate(content, 6000)
	messages := []ai.Message{
		{Role: "system", Content: "你是博客摘要助手。用一句话总结博客核心内容，严格不超过80字，直接输出总结，不要解释、不要引号。"},
		{Role: "user", Content: input},
	}
	result, err := s.ai.Complete(ctx, messages, 200)
	if err != nil || result.Text == "" {
		return generateExcerpt(content)
	}
	summary := cleanExcerpt(result.Text)
	if summary == "" {
		return generateExcerpt(content)
	}
	return summary
}

// GenerateSummary produces a longer 2-3 paragraph summary and persists it.
func (s *blogService) GenerateSummary(ctx context.Context, blogID int64) (*model.AISummary, error) {
	blog, err := s.blogRepo.GetByID(ctx, blogID, nil)
	if err != nil {
		return nil, err
	}
	if s.ai == nil || !s.ai.Available() {
		return nil, errors.New("AI service not configured")
	}
	input := truncate(blog.Content, 8000)
	messages := []ai.Message{
		{Role: "system", Content: "你是博客总结助手。总结这篇博客的核心内容，严格不超过200字。输出前请自行检查字数，若超过200字则精简后再输出。直接输出纯文本，不要前言、不要标题、不要 markdown 符号。"},
		{Role: "user", Content: input},
	}
	result, err := s.ai.Complete(ctx, messages, 400)
	if err != nil {
		return nil, err
	}
	summary := &model.AISummary{
		BlogID:     blogID,
		Summary:    strings.TrimSpace(result.Text),
		Model:      s.ai.ModelName(),
		TokensUsed: result.TokensUsed,
	}
	if err := s.aiSummaryRepo.Upsert(ctx, summary); err != nil {
		return nil, err
	}

	// Also regenerate the one-line excerpt so list/home stay in sync.
	if newExcerpt := s.generateAIExcerpt(ctx, blog.Content); newExcerpt != "" && newExcerpt != blog.Excerpt {
		if err := s.blogRepo.UpdateExcerpt(ctx, blogID, newExcerpt); err != nil {
			log.Warn().Err(err).Int64("blog_id", blogID).Msg("failed to update excerpt")
		}
	}

	return summary, nil
}

// GetSummary returns the persisted AI summary for a blog, or nil if none exists.
// It applies the same visibility check as GetByID so drafts aren't leaked.
func (s *blogService) GetSummary(ctx context.Context, blogID int64, currentUserID *int64) (*model.AISummary, error) {
	// Verify the caller can access this blog (drafts only visible to owner/admin).
	if _, err := s.blogRepo.GetByID(ctx, blogID, currentUserID); err != nil {
		return nil, err
	}
	summary, err := s.aiSummaryRepo.GetByBlogID(ctx, blogID)
	if err != nil {
		if contentRepo.IsNotFound(err) {
			return nil, nil
		}
		return nil, err
	}
	return summary, nil
}

// attachAISummary loads the AI summary onto the blog's joined field, if any.
func (s *blogService) attachAISummary(ctx context.Context, blog *model.Blog) {
	if s.aiSummaryRepo == nil {
		return
	}
	summary, err := s.aiSummaryRepo.GetByBlogID(ctx, blog.ID)
	if err == nil && summary != nil {
		blog.AISummary = summary
	}
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

func truncate(s string, n int) string {
	if len(s) > n {
		return s[:n]
	}
	return s
}

func cleanExcerpt(s string) string {
	s = strings.TrimSpace(s)
	s = strings.Trim(s, "\"'“”‘’ \n\r\t")
	return s
}
