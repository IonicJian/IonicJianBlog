package response

import "time"

type CommentResponse struct {
	ID          int64            `json:"id"`
	BlogID      int64            `json:"blog_id"`
	UserID      int64            `json:"user_id"`
	ParentID    *int64           `json:"parent_id,omitempty"`
	Content     string           `json:"content"`
	AnchorStart *string          `json:"anchor_start,omitempty"`
	AnchorEnd   *string          `json:"anchor_end,omitempty"`
	AnchorText  *string          `json:"anchor_text,omitempty"`
	IsApproved  bool             `json:"is_approved"`
	CreatedAt   time.Time        `json:"created_at"`
	UpdatedAt   time.Time        `json:"updated_at"`
	Author      *UserResponse    `json:"author,omitempty"`
	LikeCount   int64            `json:"like_count"`
	LikedByMe   bool             `json:"liked_by_me"`
	Replies     []*CommentResponse `json:"replies,omitempty"`
}
