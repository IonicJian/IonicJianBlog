package response

import "time"

type BlogResponse struct {
	ID          int64          `json:"id"`
	UserID      int64          `json:"user_id"`
	Title       string         `json:"title"`
	Slug        string         `json:"slug"`
	Content     string         `json:"content"`
	ContentHTML string         `json:"content_html"`
	Excerpt     string         `json:"excerpt"`
	CoverImage  string         `json:"cover_image"`
	Status      string         `json:"status"`
	ViewCount   int            `json:"view_count"`
	IsTop       bool           `json:"is_top"`
	CategoryID  *int64         `json:"category_id,omitempty"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	Author      *UserResponse  `json:"author,omitempty"`
	LikeCount   int64          `json:"like_count"`
	LikedByMe   bool           `json:"liked_by_me"`
	Tags        []*TagResponse `json:"tags,omitempty"`
}

type BlogListResponse struct {
	ID         int64          `json:"id"`
	Title      string         `json:"title"`
	Slug       string         `json:"slug"`
	Excerpt    string         `json:"excerpt"`
	CoverImage string         `json:"cover_image"`
	Status     string         `json:"status"`
	ViewCount  int            `json:"view_count"`
	IsTop      bool           `json:"is_top"`
	CategoryID *int64         `json:"category_id,omitempty"`
	CreatedAt  time.Time      `json:"created_at"`
	UpdatedAt  time.Time      `json:"updated_at"`
	Author     *UserResponse  `json:"author,omitempty"`
	LikeCount  int64          `json:"like_count"`
	LikedByMe  bool           `json:"liked_by_me"`
	Tags       []*TagResponse `json:"tags,omitempty"`
}

type TagResponse struct {
	ID        int64     `json:"id"`
	Name      string    `json:"name"`
	Slug      string    `json:"slug"`
	Color     string    `json:"color"`
	PostCount int64     `json:"post_count,omitempty"`
	CreatedAt time.Time `json:"created_at"`
}
