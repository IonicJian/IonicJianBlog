package auth

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"net/url"
	"strings"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/rs/zerolog/log"
	"github.com/zanelin/blog/internal/config"
	"github.com/zanelin/blog/internal/model"
	"github.com/zanelin/blog/internal/pkg/jwt"
	"github.com/zanelin/blog/internal/pkg/password"
	userRepo "github.com/zanelin/blog/internal/repository/user"
)

var githubHTTPClient = &http.Client{Timeout: 15 * time.Second}

var (
	ErrUserExists         = errors.New("user already exists")
	ErrInvalidCredentials = errors.New("invalid credentials")
	ErrUserNotFound       = errors.New("user not found")
)

type Service interface {
	Register(ctx context.Context, username, email, plainPassword string) (*model.User, *jwt.TokenPair, error)
	Login(ctx context.Context, email, plainPassword string) (*model.User, *jwt.TokenPair, error)
	RefreshToken(ctx context.Context, refreshToken string) (*jwt.TokenPair, error)
	GetUserByID(ctx context.Context, id int64) (*model.User, error)
	GetSiteOwner(ctx context.Context) (*model.User, error)
	UpdateProfile(ctx context.Context, id int64, displayName, bio, avatarURL string) (*model.User, error)
	GetGitHubAuthURL() (string, string)
	GitHubCallback(ctx context.Context, code, state string) (*model.User, *jwt.TokenPair, error)
}

type authService struct {
	userRepo userRepo.Repository
	cfg      *config.Config
}

func New(userRepo userRepo.Repository, cfg *config.Config) Service {
	return &authService{userRepo: userRepo, cfg: cfg}
}

func (s *authService) Register(ctx context.Context, username, email, plainPassword string) (*model.User, *jwt.TokenPair, error) {
	existing, _ := s.userRepo.GetByEmail(ctx, email)
	if existing != nil {
		return nil, nil, ErrUserExists
	}
	existing, _ = s.userRepo.GetByUsername(ctx, username)
	if existing != nil {
		return nil, nil, ErrUserExists
	}

	hashed, err := password.Hash(plainPassword)
	if err != nil {
		return nil, nil, err
	}

	user := &model.User{
		Username:     username,
		Email:        email,
		PasswordHash: hashed,
		DisplayName:  username,
		Role:         "user",
		IsActive:     true,
	}

	if err := s.userRepo.Create(ctx, user); err != nil {
		return nil, nil, err
	}

	tokens, err := s.generateTokens(user)
	if err != nil {
		return nil, nil, err
	}
	return user, tokens, nil
}

func (s *authService) Login(ctx context.Context, email, plainPassword string) (*model.User, *jwt.TokenPair, error) {
	user, err := s.userRepo.GetByEmail(ctx, email)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, nil, ErrInvalidCredentials
		}
		return nil, nil, err
	}

	if !password.Verify(plainPassword, user.PasswordHash) {
		return nil, nil, ErrInvalidCredentials
	}

	if !user.IsActive {
		return nil, nil, ErrInvalidCredentials
	}

	tokens, err := s.generateTokens(user)
	if err != nil {
		return nil, nil, err
	}
	return user, tokens, nil
}

func (s *authService) RefreshToken(ctx context.Context, refreshToken string) (*jwt.TokenPair, error) {
	claims, err := jwt.ValidateToken(refreshToken, s.cfg.JWT.Secret)
	if err != nil {
		return nil, ErrInvalidCredentials
	}
	if claims.Subject != "refresh" {
		return nil, ErrInvalidCredentials
	}
	user, err := s.userRepo.GetByID(ctx, claims.UserID)
	if err != nil {
		return nil, ErrInvalidCredentials
	}
	return s.generateTokens(user)
}

func (s *authService) GetUserByID(ctx context.Context, id int64) (*model.User, error) {
	return s.userRepo.GetByID(ctx, id)
}

func (s *authService) UpdateProfile(ctx context.Context, id int64, displayName, bio, avatarURL string) (*model.User, error) {
	user, err := s.userRepo.GetByID(ctx, id)
	if err != nil {
		return nil, ErrUserNotFound
	}
	if displayName != "" {
		user.DisplayName = displayName
	}
	if bio != "" {
		user.Bio = bio
	}
	if avatarURL != "" {
		user.AvatarURL = avatarURL
	}
	if err := s.userRepo.Update(ctx, user); err != nil {
		return nil, err
	}
	return user, nil
}

func (s *authService) GetGitHubAuthURL() (string, string) {
	stateBytes := make([]byte, 16)
	rand.Read(stateBytes)
	state := hex.EncodeToString(stateBytes)

	authURL := fmt.Sprintf(
		"https://github.com/login/oauth/authorize?client_id=%s&redirect_uri=%s&scope=user:email&state=%s",
		url.QueryEscape(s.cfg.GitHub.ClientID),
		url.QueryEscape(s.cfg.GitHub.RedirectURL),
		state,
	)
	return authURL, state
}

func (s *authService) GitHubCallback(ctx context.Context, code, state string) (*model.User, *jwt.TokenPair, error) {
	accessToken, err := s.exchangeCodeForToken(code)
	if err != nil {
		log.Error().Err(err).Msg("github oauth: failed to exchange code for token")
		return nil, nil, fmt.Errorf("exchange code: %w", err)
	}

	githubUser, err := s.getGitHubUser(accessToken)
	if err != nil {
		log.Error().Err(err).Msg("github oauth: failed to get user info")
		return nil, nil, fmt.Errorf("get github user: %w", err)
	}

	log.Info().Int64("github_id", githubUser.ID).Str("login", githubUser.Login).Msg("github oauth: user authenticated")

	user, err := s.userRepo.GetByGithubID(ctx, githubUser.ID)
	if err != nil && !errors.Is(err, pgx.ErrNoRows) {
		return nil, nil, err
	}

	if user == nil {
		existing, _ := s.userRepo.GetByEmail(ctx, githubUser.Email)
		if existing != nil {
			existing.GithubID = &githubUser.ID
			existing.AvatarURL = githubUser.AvatarURL
			_ = s.userRepo.Update(ctx, existing)
			user = existing
		} else {
			user = &model.User{
				Username:    generateGitHubUsername(githubUser.Login),
				Email:       githubUser.Email,
				DisplayName: githubUser.Name,
				AvatarURL:   githubUser.AvatarURL,
				GithubID:    &githubUser.ID,
				Role:        "user",
				IsActive:    true,
			}
			if user.DisplayName == "" {
				user.DisplayName = githubUser.Login
			}
			if err := s.userRepo.Create(ctx, user); err != nil {
				return nil, nil, err
			}
		}
	}

	if s.cfg.GitHub.AdminGitHubID > 0 && user.GithubID != nil && *user.GithubID == s.cfg.GitHub.AdminGitHubID && user.Role != "admin" {
		_ = s.userRepo.SetRole(ctx, user.ID, "admin")
		user.Role = "admin"
	}

	tokens, err := s.generateTokens(user)
	if err != nil {
		return nil, nil, err
	}
	return user, tokens, nil
}

type githubUserInfo struct {
	ID        int64  `json:"id"`
	Login     string `json:"login"`
	Name      string `json:"name"`
	Email     string `json:"email"`
	AvatarURL string `json:"avatar_url"`
}

func (s *authService) exchangeCodeForToken(code string) (string, error) {
	data := url.Values{
		"client_id":     {s.cfg.GitHub.ClientID},
		"client_secret": {s.cfg.GitHub.ClientSecret},
		"code":          {code},
	}
	req, _ := http.NewRequest("POST", "https://github.com/login/oauth/access_token", strings.NewReader(data.Encode()))
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	req.Header.Set("Accept", "application/json")

	resp, err := githubHTTPClient.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	var result struct {
		AccessToken string `json:"access_token"`
		Error       string `json:"error"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return "", err
	}
	if result.Error != "" {
		return "", fmt.Errorf("github oauth error: %s", result.Error)
	}
	return result.AccessToken, nil
}

func (s *authService) getGitHubUser(accessToken string) (*githubUserInfo, error) {
	req, _ := http.NewRequest("GET", "https://api.github.com/user", nil)
	req.Header.Set("Authorization", "Bearer "+accessToken)
	req.Header.Set("Accept", "application/json")

	resp, err := githubHTTPClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	var user githubUserInfo
	if err := json.NewDecoder(resp.Body).Decode(&user); err != nil {
		return nil, err
	}

	if user.Email == "" {
		req2, _ := http.NewRequest("GET", "https://api.github.com/user/emails", nil)
		req2.Header.Set("Authorization", "Bearer "+accessToken)
		req2.Header.Set("Accept", "application/json")
		resp2, err := githubHTTPClient.Do(req2)
		if err == nil {
			defer resp2.Body.Close()
			var emails []struct {
				Email    string `json:"email"`
				Primary  bool   `json:"primary"`
				Verified bool   `json:"verified"`
			}
			json.NewDecoder(resp2.Body).Decode(&emails)
			for _, e := range emails {
				if e.Primary && e.Verified {
					user.Email = e.Email
					break
				}
			}
			if user.Email == "" && len(emails) > 0 {
				user.Email = emails[0].Email
			}
		}
	}

	return &user, nil
}

func (s *authService) generateTokens(user *model.User) (*jwt.TokenPair, error) {
	return jwt.GenerateTokenPair(
		user.ID, user.Username, user.Role,
		s.cfg.JWT.Secret, s.cfg.JWT.AccessExpiry, s.cfg.JWT.RefreshExpiry,
	)
}

func generateGitHubUsername(login string) string {
	return login
}

func (s *authService) GetSiteOwner(ctx context.Context) (*model.User, error) {
	return s.userRepo.GetSiteOwner(ctx)
}
