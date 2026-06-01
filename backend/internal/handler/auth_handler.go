package handler

import (
	"errors"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/zanelin/blog/internal/dto/request"
	dto "github.com/zanelin/blog/internal/dto/response"
	"github.com/zanelin/blog/internal/middleware"
	"github.com/zanelin/blog/internal/model"
	resp "github.com/zanelin/blog/internal/pkg/response"
	"github.com/zanelin/blog/internal/service"
)

type AuthHandler struct {
	authService service.AuthService
}

func NewAuthHandler(authService service.AuthService) *AuthHandler {
	return &AuthHandler{authService: authService}
}

func (h *AuthHandler) Register(c *gin.Context) {
	var req request.RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		resp.BadRequest(c, err.Error())
		return
	}

	user, tokens, err := h.authService.Register(c.Request.Context(), req.Username, req.Email, req.Password)
	if err != nil {
		if errors.Is(err, service.ErrUserExists) {
			resp.Error(c, http.StatusConflict, 409, "user already exists")
			return
		}
		resp.InternalError(c, err.Error())
		return
	}

	resp.Success(c, dto.AuthResponse{
		User:         toUserResponse(user),
		AccessToken:  tokens.AccessToken,
		RefreshToken: tokens.RefreshToken,
		ExpiresIn:    tokens.ExpiresIn,
	})
}

func (h *AuthHandler) Login(c *gin.Context) {
	var req request.LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		resp.BadRequest(c, err.Error())
		return
	}

	user, tokens, err := h.authService.Login(c.Request.Context(), req.Email, req.Password)
	if err != nil {
		if errors.Is(err, service.ErrInvalidCredentials) {
			resp.Unauthorized(c, "invalid email or password")
			return
		}
		resp.InternalError(c, err.Error())
		return
	}

	resp.Success(c, dto.AuthResponse{
		User:         toUserResponse(user),
		AccessToken:  tokens.AccessToken,
		RefreshToken: tokens.RefreshToken,
		ExpiresIn:    tokens.ExpiresIn,
	})
}

func (h *AuthHandler) RefreshToken(c *gin.Context) {
	var req request.RefreshTokenRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		resp.BadRequest(c, err.Error())
		return
	}

	tokens, err := h.authService.RefreshToken(c.Request.Context(), req.RefreshToken)
	if err != nil {
		resp.Unauthorized(c, "invalid refresh token")
		return
	}

	resp.Success(c, gin.H{
		"access_token":  tokens.AccessToken,
		"refresh_token": tokens.RefreshToken,
		"expires_in":    tokens.ExpiresIn,
	})
}

func (h *AuthHandler) Logout(c *gin.Context) {
	// Stateless JWT: logout is handled client-side by removing tokens
	resp.Success(c, nil)
}

func (h *AuthHandler) GitHubLogin(c *gin.Context) {
	// TODO: Implement in Phase 4
	resp.Error(c, http.StatusNotImplemented, 501, "GitHub login not yet implemented")
}

func (h *AuthHandler) GitHubCallback(c *gin.Context) {
	// TODO: Implement in Phase 4
	resp.Error(c, http.StatusNotImplemented, 501, "GitHub login not yet implemented")
}

func (h *AuthHandler) GetProfile(c *gin.Context) {
	userID := c.GetInt64(middleware.ContextKeyUserID)
	user, err := h.authService.GetUserByID(c.Request.Context(), userID)
	if err != nil {
		resp.NotFound(c, "user not found")
		return
	}
	resp.Success(c, toUserResponse(user))
}

func (h *AuthHandler) UpdateProfile(c *gin.Context) {
	var req request.UpdateProfileRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		resp.BadRequest(c, err.Error())
		return
	}

	userID := c.GetInt64(middleware.ContextKeyUserID)
	user, err := h.authService.UpdateProfile(c.Request.Context(), userID, req.DisplayName, req.Bio, req.AvatarURL)
	if err != nil {
		resp.InternalError(c, err.Error())
		return
	}

	resp.Success(c, toUserResponse(user))
}

func toUserResponse(user *model.User) dto.UserResponse {
	// We use a different import alias to avoid confusion
	return dto.UserResponse{
		ID:          user.ID,
		Username:    user.Username,
		Email:       user.Email,
		DisplayName: user.DisplayName,
		AvatarURL:   user.AvatarURL,
		Bio:         user.Bio,
		GithubID:    user.GithubID,
		Role:        user.Role,
		CreatedAt:   user.CreatedAt,
		UpdatedAt:   user.UpdatedAt,
	}
}
