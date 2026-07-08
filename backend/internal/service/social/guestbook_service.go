package social

import (
	"context"

	"github.com/zanelin/blog/internal/model"
	socialRepo "github.com/zanelin/blog/internal/repository/social"
	userRepo "github.com/zanelin/blog/internal/repository/user"
)

type GuestbookService interface {
	List(ctx context.Context, page, pageSize int) ([]*model.GuestbookMessage, int64, error)
	GetByID(ctx context.Context, id int64) (*model.GuestbookMessage, error)
	Create(ctx context.Context, userID *int64, anonymous bool, content string) (*model.GuestbookMessage, error)
	Delete(ctx context.Context, id int64) error
}

type guestbookService struct {
	repo     socialRepo.GuestbookRepository
	userRepo userRepo.Repository
}

func NewGuestbookService(repo socialRepo.GuestbookRepository, userRepo userRepo.Repository) GuestbookService {
	return &guestbookService{repo: repo, userRepo: userRepo}
}

func (s *guestbookService) List(ctx context.Context, page, pageSize int) ([]*model.GuestbookMessage, int64, error) {
	return s.repo.List(ctx, page, pageSize)
}

func (s *guestbookService) GetByID(ctx context.Context, id int64) (*model.GuestbookMessage, error) {
	return s.repo.GetByID(ctx, id)
}

// Create stores a guestbook message. When anonymous is false and the caller is
// logged in, the user's display name (or username) is used as the nickname;
// otherwise the nickname is left empty so the UI renders "匿名".
func (s *guestbookService) Create(ctx context.Context, userID *int64, anonymous bool, content string) (*model.GuestbookMessage, error) {
	nickname := ""
	if !anonymous && userID != nil {
		if user, err := s.userRepo.GetByID(ctx, *userID); err == nil {
			nickname = user.DisplayName
			if nickname == "" {
				nickname = user.Username
			}
		}
	}
	m := &model.GuestbookMessage{UserID: userID, Nickname: nickname, Content: content}
	return m, s.repo.Create(ctx, m)
}

func (s *guestbookService) Delete(ctx context.Context, id int64) error { return s.repo.Delete(ctx, id) }
