package request

type CreateBlogRequest struct {
	Title      string   `json:"title" binding:"required,min=1,max=255"`
	Content    string   `json:"content" binding:"required"`
	CoverImage string   `json:"cover_image"`
	Status     string   `json:"status" binding:"oneof=draft published"`
	TagIDs     []int64  `json:"tag_ids"`
	IsTop      bool     `json:"is_top"`
}

type UpdateBlogRequest struct {
	Title      string   `json:"title" binding:"min=1,max=255"`
	Content    string   `json:"content"`
	CoverImage string   `json:"cover_image"`
	Status     string   `json:"status" binding:"oneof=draft published"`
	TagIDs     []int64  `json:"tag_ids"`
	IsTop      *bool    `json:"is_top"`
}
