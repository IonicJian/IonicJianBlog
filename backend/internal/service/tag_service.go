package service

import (
	"context"
	"regexp"
	"strings"

	"github.com/zanelin/blog/internal/model"
	"github.com/zanelin/blog/internal/repository"
)

type TagService interface {
	Create(ctx context.Context, name, color string) (*model.Tag, error)
	Update(ctx context.Context, id int64, name, color string) (*model.Tag, error)
	Delete(ctx context.Context, id int64) error
	List(ctx context.Context) ([]*model.Tag, error)
}

type tagService struct {
	tagRepo repository.TagRepository
}

func NewTagService(tagRepo repository.TagRepository) TagService {
	return &tagService{tagRepo: tagRepo}
}

func (s *tagService) Create(ctx context.Context, name, color string) (*model.Tag, error) {
	tag := &model.Tag{
		Name:  name,
		Slug:  tagSlug(name),
		Color: color,
	}
	if tag.Color == "" {
		tag.Color = "#6366f1"
	}
	return tag, s.tagRepo.Create(ctx, tag)
}

func (s *tagService) Update(ctx context.Context, id int64, name, color string) (*model.Tag, error) {
	tag, err := s.tagRepo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if name != "" {
		tag.Name = name
		tag.Slug = tagSlug(name)
	}
	if color != "" {
		tag.Color = color
	}
	return tag, s.tagRepo.Update(ctx, tag)
}

func (s *tagService) Delete(ctx context.Context, id int64) error {
	return s.tagRepo.Delete(ctx, id)
}

func (s *tagService) List(ctx context.Context) ([]*model.Tag, error) {
	return s.tagRepo.List(ctx)
}

func tagSlug(name string) string {
	slug := strings.ToLower(name)
	re := regexp.MustCompile(`[^a-z0-9]+`)
	slug = re.ReplaceAllString(slug, "-")
	return strings.Trim(slug, "-")
}
