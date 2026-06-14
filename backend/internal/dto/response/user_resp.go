package response

import "time"

type UserProfileResponse struct {
	ID          int64     `json:"id"`
	Username    string    `json:"username"`
	DisplayName string    `json:"display_name"`
	AvatarURL   string    `json:"avatar_url"`
	Bio         string    `json:"bio"`
	Role        string    `json:"role"`
	CreatedAt   time.Time `json:"created_at"`
}
