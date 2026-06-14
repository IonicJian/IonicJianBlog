package social

import (
	"context"

	"github.com/zanelin/blog/internal/model"
	socialRepo "github.com/zanelin/blog/internal/repository/social"
)

type CommentService interface {
	Create(ctx context.Context, blogID, userID int64, req CreateCommentParams) (*model.Comment, error)
	GetByID(ctx context.Context, id int64) (*model.Comment, error)
	Delete(ctx context.Context, id int64) error
	List(ctx context.Context, blogID int64, page, pageSize int) ([]*model.Comment, int64, error)
}

type CreateCommentParams struct {
	Content     string
	ParentID    *int64
	AnchorStart string
	AnchorEnd   string
	AnchorText  string
}

type commentService struct {
	commentRepo socialRepo.CommentRepository
}

func NewCommentService(commentRepo socialRepo.CommentRepository) CommentService {
	return &commentService{commentRepo: commentRepo}
}

func (s *commentService) Create(ctx context.Context, blogID, userID int64, params CreateCommentParams) (*model.Comment, error) {
	c := &model.Comment{BlogID: blogID, UserID: userID, ParentID: params.ParentID, Content: params.Content}
	if params.AnchorStart != "" { s := params.AnchorStart; c.AnchorStart = &s }
	if params.AnchorEnd != "" { e := params.AnchorEnd; c.AnchorEnd = &e }
	if params.AnchorText != "" { t := params.AnchorText; c.AnchorText = &t }
	if err := s.commentRepo.Create(ctx, c); err != nil { return nil, err }
	return c, nil
}

func (s *commentService) GetByID(ctx context.Context, id int64) (*model.Comment, error) {
	return s.commentRepo.GetByID(ctx, id)
}

func (s *commentService) Delete(ctx context.Context, id int64) error { return s.commentRepo.Delete(ctx, id) }

func (s *commentService) List(ctx context.Context, blogID int64, page, pageSize int) ([]*model.Comment, int64, error) {
	return s.commentRepo.ListByBlogID(ctx, blogID, page, pageSize)
}
