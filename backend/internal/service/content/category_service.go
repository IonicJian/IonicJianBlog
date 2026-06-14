package content

import (
	"context"

	"github.com/zanelin/blog/internal/model"
	contentRepo "github.com/zanelin/blog/internal/repository/content"
	"github.com/zanelin/blog/internal/pkg/slug"
)

type CategoryService interface {
	List(ctx context.Context) ([]*model.Category, error)
	Create(ctx context.Context, name, description string, sortOrder int, parentID *int64) (*model.Category, error)
	Update(ctx context.Context, id int64, name, description string, sortOrder int, parentID *int64) (*model.Category, error)
	Delete(ctx context.Context, id int64) error
}

type categoryService struct {
	repo contentRepo.CategoryRepository
}

func NewCategoryService(repo contentRepo.CategoryRepository) CategoryService {
	return &categoryService{repo: repo}
}

func (s *categoryService) List(ctx context.Context) ([]*model.Category, error) { return s.repo.List(ctx) }

func (s *categoryService) Create(ctx context.Context, name, description string, sortOrder int, parentID *int64) (*model.Category, error) {
	c := &model.Category{Name: name, Slug: slug.Generate(name), Description: description, SortOrder: sortOrder, ParentID: parentID}
	return c, s.repo.Create(ctx, c)
}

func (s *categoryService) Update(ctx context.Context, id int64, name, description string, sortOrder int, parentID *int64) (*model.Category, error) {
	c := &model.Category{ID: id, Name: name, Slug: slug.Generate(name), Description: description, SortOrder: sortOrder, ParentID: parentID}
	return c, s.repo.Update(ctx, c)
}

func (s *categoryService) Delete(ctx context.Context, id int64) error { return s.repo.Delete(ctx, id) }
