package content

import (
	"context"

	"github.com/zanelin/blog/internal/model"
	contentRepo "github.com/zanelin/blog/internal/repository/content"
	"github.com/zanelin/blog/internal/pkg/slug"
)

type TagService interface {
	Create(ctx context.Context, name, color string) (*model.Tag, error)
	Update(ctx context.Context, id int64, name, color string) (*model.Tag, error)
	Delete(ctx context.Context, id int64) error
	List(ctx context.Context) ([]*model.Tag, error)
}

type tagService struct {
	tagRepo contentRepo.TagRepository
}

func NewTagService(tagRepo contentRepo.TagRepository) TagService {
	return &tagService{tagRepo: tagRepo}
}

func (s *tagService) Create(ctx context.Context, name, color string) (*model.Tag, error) {
	tag := &model.Tag{
		Name:  name,
		Slug:  slug.Generate(name),
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
		tag.Slug = slug.Generate(name)
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
