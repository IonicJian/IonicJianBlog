package social

import (
	"context"

	socialRepo "github.com/zanelin/blog/internal/repository/social"
)

type LikeService interface {
	Toggle(ctx context.Context, userID int64, targetType string, targetID int64) (bool, int64, error)
	GetStatus(ctx context.Context, userID int64, targetType string, targetID int64) (bool, int64, error)
}

type likeService struct {
	likeRepo socialRepo.LikeRepository
}

func NewLikeService(likeRepo socialRepo.LikeRepository) LikeService {
	return &likeService{likeRepo: likeRepo}
}

func (s *likeService) Toggle(ctx context.Context, userID int64, targetType string, targetID int64) (bool, int64, error) {
	liked, err := s.likeRepo.Toggle(ctx, userID, targetType, targetID)
	if err != nil { return false, 0, err }
	count, err := s.likeRepo.Count(ctx, targetType, targetID)
	if err != nil { return false, 0, err }
	return liked, count, nil
}

func (s *likeService) GetStatus(ctx context.Context, userID int64, targetType string, targetID int64) (bool, int64, error) {
	liked, err := s.likeRepo.IsLiked(ctx, userID, targetType, targetID)
	if err != nil { return false, 0, err }
	count, err := s.likeRepo.Count(ctx, targetType, targetID)
	if err != nil { return false, 0, err }
	return liked, count, nil
}
