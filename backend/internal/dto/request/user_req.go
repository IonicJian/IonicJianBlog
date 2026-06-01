package request

type CreateGuestbookRequest struct {
	Nickname string `json:"nickname" binding:"max=128"`
	Content  string `json:"content" binding:"required,min=1,max=2000"`
}
