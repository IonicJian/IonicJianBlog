package service

import (
	"context"

	"github.com/zanelin/blog/internal/model"
	"github.com/zanelin/blog/internal/repository"
)

type GuestbookService interface {
	List(ctx context.Context, page, pageSize int) ([]*model.GuestbookMessage, int64, error)
	Create(ctx context.Context, userID *int64, nickname, content string) (*model.GuestbookMessage, error)
	Delete(ctx context.Context, id int64) error
}

type guestbookService struct {
	repo repository.GuestbookRepository
}

func NewGuestbookService(repo repository.GuestbookRepository) GuestbookService {
	return &guestbookService{repo: repo}
}

func (s *guestbookService) List(ctx context.Context, page, pageSize int) ([]*model.GuestbookMessage, int64, error) {
	return s.repo.List(ctx, page, pageSize)
}

func (s *guestbookService) Create(ctx context.Context, userID *int64, nickname, content string) (*model.GuestbookMessage, error) {
	m := &model.GuestbookMessage{
		UserID:   userID,
		Nickname: nickname,
		Content:  content,
	}
	return m, s.repo.Create(ctx, m)
}

func (s *guestbookService) Delete(ctx context.Context, id int64) error {
	return s.repo.Delete(ctx, id)
}
