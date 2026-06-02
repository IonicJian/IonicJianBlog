package service

import (
	"context"

	"github.com/zanelin/blog/internal/model"
	"github.com/zanelin/blog/internal/repository"
)

type FriendLinkService interface {
	List(ctx context.Context) ([]*model.FriendLink, error)
	Create(ctx context.Context, name, url, description, logoURL string, sortOrder int) (*model.FriendLink, error)
	Update(ctx context.Context, id int64, name, url, description, logoURL string, sortOrder int, isActive *bool) (*model.FriendLink, error)
	Delete(ctx context.Context, id int64) error
}

type friendLinkService struct {
	repo repository.FriendLinkRepository
}

func NewFriendLinkService(repo repository.FriendLinkRepository) FriendLinkService {
	return &friendLinkService{repo: repo}
}

func (s *friendLinkService) List(ctx context.Context) ([]*model.FriendLink, error) {
	return s.repo.List(ctx)
}

func (s *friendLinkService) Create(ctx context.Context, name, url, description, logoURL string, sortOrder int) (*model.FriendLink, error) {
	fl := &model.FriendLink{
		Name:        name,
		URL:         url,
		Description: description,
		LogoURL:     logoURL,
		SortOrder:   sortOrder,
		IsActive:    true,
	}
	return fl, s.repo.Create(ctx, fl)
}

func (s *friendLinkService) Update(ctx context.Context, id int64, name, url, description, logoURL string, sortOrder int, isActive *bool) (*model.FriendLink, error) {
	fl := &model.FriendLink{ID: id, Name: name, URL: url, Description: description, LogoURL: logoURL, SortOrder: sortOrder, IsActive: true}
	if isActive != nil {
		fl.IsActive = *isActive
	}
	return fl, s.repo.Update(ctx, fl)
}

func (s *friendLinkService) Delete(ctx context.Context, id int64) error {
	return s.repo.Delete(ctx, id)
}
