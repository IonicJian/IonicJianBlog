package social

import (
	"context"

	"github.com/zanelin/blog/internal/model"
	socialRepo "github.com/zanelin/blog/internal/repository/social"
)

type GuestbookService interface {
	List(ctx context.Context, page, pageSize int) ([]*model.GuestbookMessage, int64, error)
	GetByID(ctx context.Context, id int64) (*model.GuestbookMessage, error)
	Create(ctx context.Context, userID *int64, nickname, content string) (*model.GuestbookMessage, error)
	Delete(ctx context.Context, id int64) error
}

type guestbookService struct {
	repo socialRepo.GuestbookRepository
}

func NewGuestbookService(repo socialRepo.GuestbookRepository) GuestbookService {
	return &guestbookService{repo: repo}
}

func (s *guestbookService) List(ctx context.Context, page, pageSize int) ([]*model.GuestbookMessage, int64, error) {
	return s.repo.List(ctx, page, pageSize)
}

func (s *guestbookService) GetByID(ctx context.Context, id int64) (*model.GuestbookMessage, error) {
	return s.repo.GetByID(ctx, id)
}

func (s *guestbookService) Create(ctx context.Context, userID *int64, nickname, content string) (*model.GuestbookMessage, error) {
	m := &model.GuestbookMessage{UserID: userID, Nickname: nickname, Content: content}
	return m, s.repo.Create(ctx, m)
}

func (s *guestbookService) Delete(ctx context.Context, id int64) error { return s.repo.Delete(ctx, id) }
