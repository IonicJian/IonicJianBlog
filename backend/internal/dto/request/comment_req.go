package request

type CreateCommentRequest struct {
	Content     string `json:"content" binding:"required,min=1,max=10000"`
	ParentID    *int64 `json:"parent_id"`
	AnchorStart string `json:"anchor_start"`
	AnchorEnd   string `json:"anchor_end"`
	AnchorText  string `json:"anchor_text"`
}
