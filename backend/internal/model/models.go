package model

import "time"

type User struct {
	ID           int64     `json:"id"`
	Username     string    `json:"username"`
	Email        string    `json:"email"`
	PasswordHash string    `json:"-"`
	DisplayName  string    `json:"display_name"`
	AvatarURL    string    `json:"avatar_url"`
	Bio          string    `json:"bio"`
	GithubID     *int64    `json:"github_id,omitempty"`
	Role         string    `json:"role"`
	IsActive     bool      `json:"is_active"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}

type Blog struct {
	ID          int64     `json:"id"`
	UserID      int64     `json:"user_id"`
	Title       string    `json:"title"`
	Slug        string    `json:"slug"`
	Content     string    `json:"content"`
	ContentHTML string    `json:"content_html"`
	Excerpt     string    `json:"excerpt"`
	CoverImage  string    `json:"cover_image"`
	Status      string    `json:"status"`
	ViewCount   int       `json:"view_count"`
	IsTop       bool      `json:"is_top"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`

	// Joined fields
	Author     *User  `json:"author,omitempty"`
	LikeCount  int64  `json:"like_count"`
	LikedByMe  bool   `json:"liked_by_me"`
	CategoryID *int64    `json:"category_id,omitempty"`
	Category   *Category `json:"category,omitempty"`
	Tags       []*Tag    `json:"tags,omitempty"`
}

type Category struct {
	ID          int64       `json:"id"`
	Name        string      `json:"name"`
	Slug        string      `json:"slug"`
	Description string      `json:"description"`
	SortOrder   int         `json:"sort_order"`
	ParentID    *int64      `json:"parent_id,omitempty"`
	Children    []*Category `json:"children,omitempty"`
	CreatedAt   time.Time   `json:"created_at"`
}

type Tag struct {
	ID        int64     `json:"id"`
	Name      string    `json:"name"`
	Slug      string    `json:"slug"`
	Color     string    `json:"color"`
	CreatedAt time.Time `json:"created_at"`

	// Joined fields
	PostCount int64 `json:"post_count,omitempty"`
}

type Comment struct {
	ID          int64     `json:"id"`
	BlogID      int64     `json:"blog_id"`
	UserID      int64     `json:"user_id"`
	ParentID    *int64    `json:"parent_id,omitempty"`
	Content     string    `json:"content"`
	AnchorStart *string   `json:"anchor_start,omitempty"`
	AnchorEnd   *string   `json:"anchor_end,omitempty"`
	AnchorText  *string   `json:"anchor_text,omitempty"`
	IsApproved  bool      `json:"is_approved"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`

	// Joined fields
	Author    *User      `json:"author,omitempty"`
	LikeCount int64      `json:"like_count"`
	LikedByMe bool       `json:"liked_by_me"`
	Replies   []*Comment `json:"replies,omitempty"`
}

type Like struct {
	ID         int64     `json:"id"`
	UserID     int64     `json:"user_id"`
	TargetType string    `json:"target_type"`
	TargetID   int64     `json:"target_id"`
	CreatedAt  time.Time `json:"created_at"`
}

type FriendLink struct {
	ID          int64     `json:"id"`
	Name        string    `json:"name"`
	URL         string    `json:"url"`
	Description string    `json:"description"`
	LogoURL     string    `json:"logo_url"`
	SortOrder   int       `json:"sort_order"`
	IsActive    bool      `json:"is_active"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

type GuestbookMessage struct {
	ID         int64     `json:"id"`
	UserID     *int64    `json:"user_id,omitempty"`
	Nickname   string    `json:"nickname"`
	Content    string    `json:"content"`
	IsApproved bool      `json:"is_approved"`
	CreatedAt  time.Time `json:"created_at"`
	UpdatedAt  time.Time `json:"updated_at"`

	// Joined fields
	Author *User `json:"author,omitempty"`
}

type AISummary struct {
	ID         int64     `json:"id"`
	BlogID     int64     `json:"blog_id"`
	Summary    string    `json:"summary"`
	Model      string    `json:"model"`
	TokensUsed int       `json:"tokens_used"`
	CreatedAt  time.Time `json:"created_at"`
	UpdatedAt  time.Time `json:"updated_at"`
}

type Photo struct {
	ID        int64     `json:"id"`
	URL       string    `json:"url"`
	Title     string    `json:"title"`
	SortOrder int       `json:"sort_order"`
	CreatedAt time.Time `json:"created_at"`
}
