package mapper

import (
	"github.com/zanelin/blog/internal/dto/response"
	"github.com/zanelin/blog/internal/model"
)

// --- User ---

func UserToResponse(u *model.User) response.UserResponse {
	return response.UserResponse{
		ID:          u.ID,
		Username:    u.Username,
		Email:       u.Email,
		DisplayName: u.DisplayName,
		AvatarURL:   u.AvatarURL,
		Bio:         u.Bio,
		GithubID:    u.GithubID,
		Role:        u.Role,
		CreatedAt:   u.CreatedAt,
		UpdatedAt:   u.UpdatedAt,
	}
}

func UserToSimpleResponse(u *model.User) *response.UserResponse {
	if u == nil {
		return nil
	}
	r := UserToResponse(u)
	return &r
}

// --- Blog ---

func BlogToListResponse(b *model.Blog) response.BlogListResponse {
	r := response.BlogListResponse{
		ID:         b.ID,
		Title:      b.Title,
		Slug:       b.Slug,
		Excerpt:    b.Excerpt,
		CoverImage: b.CoverImage,
		Status:     b.Status,
		ViewCount:  b.ViewCount,
		IsTop:      b.IsTop,
		CategoryID: b.CategoryID,
		CreatedAt:  b.CreatedAt,
		UpdatedAt:  b.UpdatedAt,
		LikeCount:  b.LikeCount,
	}
	if b.Author != nil {
		u := UserToResponse(b.Author)
		r.Author = &u
	}
	if b.Tags != nil {
		for _, t := range b.Tags {
			r.Tags = append(r.Tags, &response.TagResponse{
				ID:        t.ID,
				Name:      t.Name,
				Slug:      t.Slug,
				Color:     t.Color,
				PostCount: t.PostCount,
				CreatedAt: t.CreatedAt,
			})
		}
	}
	return r
}

func BlogToDetailResponse(b *model.Blog) response.BlogResponse {
	r := response.BlogResponse{
		ID:          b.ID,
		UserID:      b.UserID,
		Title:       b.Title,
		Slug:        b.Slug,
		Content:     b.Content,
		ContentHTML: b.ContentHTML,
		Excerpt:     b.Excerpt,
		CoverImage:  b.CoverImage,
		Status:      b.Status,
		ViewCount:   b.ViewCount,
		IsTop:       b.IsTop,
		CategoryID:  b.CategoryID,
		CreatedAt:   b.CreatedAt,
		UpdatedAt:   b.UpdatedAt,
		LikeCount:   b.LikeCount,
		LikedByMe:   b.LikedByMe,
	}
	if b.Author != nil {
		u := UserToResponse(b.Author)
		r.Author = &u
	}
	if b.Tags != nil {
		for _, t := range b.Tags {
			r.Tags = append(r.Tags, &response.TagResponse{
				ID:        t.ID,
				Name:      t.Name,
				Slug:      t.Slug,
				Color:     t.Color,
				PostCount: t.PostCount,
				CreatedAt: t.CreatedAt,
			})
		}
	}
	return r
}

// --- Comment ---

func CommentToResponse(c *model.Comment) *response.CommentResponse {
	r := &response.CommentResponse{
		ID:          c.ID,
		BlogID:      c.BlogID,
		UserID:      c.UserID,
		ParentID:    c.ParentID,
		Content:     c.Content,
		AnchorStart: c.AnchorStart,
		AnchorEnd:   c.AnchorEnd,
		AnchorText:  c.AnchorText,
		IsApproved:  c.IsApproved,
		CreatedAt:   c.CreatedAt,
		UpdatedAt:   c.UpdatedAt,
		LikeCount:   c.LikeCount,
	}
	if c.Author != nil {
		r.Author = &response.UserResponse{
			ID:          c.Author.ID,
			Username:    c.Author.Username,
			DisplayName: c.Author.DisplayName,
			AvatarURL:   c.Author.AvatarURL,
		}
	}
	if c.Replies != nil {
		for _, reply := range c.Replies {
			r.Replies = append(r.Replies, CommentToResponse(reply))
		}
	}
	return r
}

// --- Tag ---

func TagToResponse(t *model.Tag) *response.TagResponse {
	return &response.TagResponse{
		ID:        t.ID,
		Name:      t.Name,
		Slug:      t.Slug,
		Color:     t.Color,
		PostCount: t.PostCount,
		CreatedAt: t.CreatedAt,
	}
}
