package content

import (
	"context"

	"github.com/zanelin/blog/internal/model"
	contentR "github.com/zanelin/blog/internal/repository/content"
)

type PhotoService interface {
	List(ctx context.Context) ([]*model.Photo, error)
	Create(ctx context.Context, url, title string, sortOrder int) (*model.Photo, error)
	Delete(ctx context.Context, id int64) error
}

type photoService struct {
	repo contentR.PhotoRepository
}

func NewPhotoService(repo contentR.PhotoRepository) PhotoService {
	return &photoService{repo: repo}
}

func (s *photoService) List(ctx context.Context) ([]*model.Photo, error) {
	return s.repo.List(ctx)
}

func (s *photoService) Create(ctx context.Context, url, title string, sortOrder int) (*model.Photo, error) {
	p := &model.Photo{URL: url, Title: title, SortOrder: sortOrder}
	if err := s.repo.Create(ctx, p); err != nil {
		return nil, err
	}
	return p, nil
}

func (s *photoService) Delete(ctx context.Context, id int64) error {
	return s.repo.Delete(ctx, id)
}
