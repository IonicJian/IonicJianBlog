package auth

import (
	"crypto/rand"
	"encoding/hex"
	"errors"
	"fmt"
	"image"
	_ "image/gif"
	_ "image/png"
	"net/http"
	_ "golang.org/x/image/webp"
	"os"
	"path/filepath"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/zanelin/blog/internal/config"
	"github.com/zanelin/blog/internal/dto/mapper"
	"github.com/zanelin/blog/internal/dto/request"
	dto "github.com/zanelin/blog/internal/dto/response"
	"github.com/zanelin/blog/internal/pkg/imageutil"
	"github.com/zanelin/blog/internal/middleware"
	resp "github.com/zanelin/blog/internal/pkg/response"
	authSvc "github.com/zanelin/blog/internal/service/auth"
)

// oauthExchangeEntry holds tokens for a single-use OAuth exchange code.
type oauthExchangeEntry struct {
	AccessToken  string
	RefreshToken string
	ExpiresIn    int64
	UserID       int64
	Role         string
}

// oauthExchangeStore is an in-memory, TTL-based store for OAuth exchange codes.
// Codes are consumed on first use and auto-expire after 5 minutes.
type oauthExchangeStore struct {
	mu    sync.RWMutex
	codes map[string]oauthExchangeEntry
}

func newOAuthExchangeStore() *oauthExchangeStore {
	return &oauthExchangeStore{codes: make(map[string]oauthExchangeEntry)}
}

func (s *oauthExchangeStore) put(e oauthExchangeEntry) (string, error) {
	b := make([]byte, 32)
	if _, err := rand.Read(b); err != nil {
		return "", err
	}
	code := hex.EncodeToString(b)

	s.mu.Lock()
	s.codes[code] = e
	s.mu.Unlock()

	time.AfterFunc(5*time.Minute, func() {
		s.mu.Lock()
		delete(s.codes, code)
		s.mu.Unlock()
	})
	return code, nil
}

func (s *oauthExchangeStore) take(code string) (oauthExchangeEntry, bool) {
	s.mu.Lock()
	defer s.mu.Unlock()
	e, ok := s.codes[code]
	if ok {
		delete(s.codes, code)
	}
	return e, ok
}

type Handler struct {
	authService authSvc.Service
	cfg         *config.Config
	oauthStore  *oauthExchangeStore
}

func New(authService authSvc.Service, cfg *config.Config) *Handler {
	return &Handler{authService: authService, cfg: cfg, oauthStore: newOAuthExchangeStore()}
}

func (h *Handler) Register(c *gin.Context) {
	var req request.RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil { resp.BadRequest(c, err.Error()); return }
	user, tokens, err := h.authService.Register(c.Request.Context(), req.Username, req.Email, req.Password)
	if err != nil {
		if errors.Is(err, authSvc.ErrUserExists) { resp.Error(c, http.StatusConflict, 409, "user already exists"); return }
		resp.InternalError(c, err.Error()); return
	}
	resp.Success(c, dto.AuthResponse{User: mapper.UserToResponse(user), AccessToken: tokens.AccessToken, RefreshToken: tokens.RefreshToken, ExpiresIn: tokens.ExpiresIn})
}

func (h *Handler) Login(c *gin.Context) {
	var req request.LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil { resp.BadRequest(c, err.Error()); return }
	user, tokens, err := h.authService.Login(c.Request.Context(), req.Email, req.Password)
	if err != nil {
		if errors.Is(err, authSvc.ErrInvalidCredentials) { resp.Unauthorized(c, "invalid email or password"); return }
		resp.InternalError(c, err.Error()); return
	}
	resp.Success(c, dto.AuthResponse{User: mapper.UserToResponse(user), AccessToken: tokens.AccessToken, RefreshToken: tokens.RefreshToken, ExpiresIn: tokens.ExpiresIn})
}

func (h *Handler) RefreshToken(c *gin.Context) {
	var req request.RefreshTokenRequest
	if err := c.ShouldBindJSON(&req); err != nil { resp.BadRequest(c, err.Error()); return }
	tokens, err := h.authService.RefreshToken(c.Request.Context(), req.RefreshToken)
	if err != nil { resp.Unauthorized(c, "invalid refresh token"); return }
	resp.Success(c, gin.H{"access_token": tokens.AccessToken, "refresh_token": tokens.RefreshToken, "expires_in": tokens.ExpiresIn})
}

func (h *Handler) Logout(c *gin.Context) { resp.Success(c, nil) }

// isHTTPS reports whether the original client request was HTTPS.
// nginx terminates TLS and forwards the scheme via X-Forwarded-Proto.
func isHTTPS(c *gin.Context) bool {
	if c.Request.TLS != nil {
		return true
	}
	return c.GetHeader("X-Forwarded-Proto") == "https"
}

func (h *Handler) GitHubLogin(c *gin.Context) {
	authURL, state := h.authService.GetGitHubAuthURL()
	secure := isHTTPS(c)
	c.SetCookie("oauth_state", state, 600, "/", "", secure, true)
	c.Redirect(http.StatusTemporaryRedirect, authURL)
}

func (h *Handler) GitHubCallback(c *gin.Context) {
	code := c.Query("code")
	state := c.Query("state")
	if code == "" { resp.BadRequest(c, "missing code"); return }
	cookieState, _ := c.Cookie("oauth_state")
	if state == "" || cookieState == "" || state != cookieState {
		resp.Error(c, http.StatusForbidden, 403, "invalid oauth state"); return
	}
	user, tokens, err := h.authService.GitHubCallback(c.Request.Context(), code, state)
	if err != nil {
		c.Redirect(http.StatusTemporaryRedirect, fmt.Sprintf("%s/login?error=github_auth_failed", h.cfg.Server.FrontendURL))
		return
	}
	// Store tokens under a single-use code instead of passing them in the URL.
	// This prevents tokens from leaking into browser history, server logs, and Referer headers.
	exchangeCode, err := h.oauthStore.put(oauthExchangeEntry{
		AccessToken:  tokens.AccessToken,
		RefreshToken: tokens.RefreshToken,
		ExpiresIn:    tokens.ExpiresIn,
		UserID:       user.ID,
		Role:         user.Role,
	})
	if err != nil {
		c.Redirect(http.StatusTemporaryRedirect, fmt.Sprintf("%s/login?error=server_error", h.cfg.Server.FrontendURL))
		return
	}
	redirectURL := fmt.Sprintf("%s/auth/callback?code=%s", h.cfg.Server.FrontendURL, exchangeCode)
	c.Redirect(http.StatusTemporaryRedirect, redirectURL)
}

// ExchangeCode exchanges a single-use OAuth code for tokens.
// The code is consumed on first use and expires after 5 minutes.
func (h *Handler) ExchangeCode(c *gin.Context) {
	var req struct {
		Code string `json:"code" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		resp.BadRequest(c, "missing code")
		return
	}
	entry, ok := h.oauthStore.take(req.Code)
	if !ok {
		resp.Error(c, http.StatusGone, 410, "code expired or already used")
		return
	}
	user, err := h.authService.GetUserByID(c.Request.Context(), entry.UserID)
	if err != nil {
		resp.NotFound(c, "user not found")
		return
	}
	resp.Success(c, dto.AuthResponse{
		User:         mapper.UserToResponse(user),
		AccessToken:  entry.AccessToken,
		RefreshToken: entry.RefreshToken,
		ExpiresIn:    entry.ExpiresIn,
	})
}

func (h *Handler) GetProfile(c *gin.Context) {
	userID := c.GetInt64(middleware.ContextKeyUserID)
	user, err := h.authService.GetUserByID(c.Request.Context(), userID)
	if err != nil { resp.NotFound(c, "user not found"); return }
	resp.Success(c, mapper.UserToResponse(user))
}

func (h *Handler) UpdateProfile(c *gin.Context) {
	var req request.UpdateProfileRequest
	if err := c.ShouldBindJSON(&req); err != nil { resp.BadRequest(c, err.Error()); return }
	userID := c.GetInt64(middleware.ContextKeyUserID)
	user, err := h.authService.UpdateProfile(c.Request.Context(), userID, req.DisplayName, req.Bio, req.AvatarURL)
	if err != nil { resp.InternalError(c, err.Error()); return }
	resp.Success(c, mapper.UserToResponse(user))
}

func (h *Handler) UploadAvatar(c *gin.Context) {
	file, header, err := c.Request.FormFile("avatar")
	if err != nil { resp.BadRequest(c, "please select an image file"); return }
	defer file.Close()

	if err := imageutil.Validate(header.Filename, header.Size, 2*1024*1024); err != nil {
		resp.BadRequest(c, err.Error()); return
	}

	img, _, err := image.Decode(file)
	if err != nil { resp.InternalError(c, "failed to decode image"); return }

	userID := c.GetInt64(middleware.ContextKeyUserID)
	if oldUser, _ := h.authService.GetUserByID(c.Request.Context(), userID); oldUser != nil && oldUser.AvatarURL != "" {
		os.Remove(filepath.Join("uploads/avatars", filepath.Base(oldUser.AvatarURL)))
	}

	filename := fmt.Sprintf("%d_%s.jpg", userID, uuid.New().String()[:8])
	avatarURL, err := imageutil.Save(img, imageutil.SaveOptions{
		Dir: "uploads/avatars", Filename: filename, Fill: true, MaxWidth: 256, Height: 256,
	})
	if err != nil { resp.InternalError(c, "failed to save avatar"); return }

	user, err := h.authService.UpdateProfile(c.Request.Context(), userID, "", "", avatarURL)
	if err != nil { resp.InternalError(c, "failed to update avatar"); return }
	resp.Success(c, gin.H{"avatar_url": avatarURL, "user": mapper.UserToResponse(user)})
}

func (h *Handler) GetSiteOwner(c *gin.Context) {
	user, err := h.authService.GetSiteOwner(c.Request.Context())
	if err != nil { resp.NotFound(c, "site owner not found"); return }
	resp.Success(c, mapper.UserToResponse(user))
}
