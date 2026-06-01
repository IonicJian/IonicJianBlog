package service

import (
	"context"
	"errors"

	"github.com/jackc/pgx/v5"
	"github.com/zanelin/blog/internal/config"
	"github.com/zanelin/blog/internal/model"
	"github.com/zanelin/blog/internal/pkg/jwt"
	"github.com/zanelin/blog/internal/pkg/password"
	"github.com/zanelin/blog/internal/repository"
)

var (
	ErrUserExists       = errors.New("user already exists")
	ErrInvalidCredentials = errors.New("invalid credentials")
	ErrUserNotFound     = errors.New("user not found")
)

type AuthService interface {
	Register(ctx context.Context, username, email, plainPassword string) (*model.User, *jwt.TokenPair, error)
	Login(ctx context.Context, email, plainPassword string) (*model.User, *jwt.TokenPair, error)
	RefreshToken(ctx context.Context, refreshToken string) (*jwt.TokenPair, error)
	GetUserByID(ctx context.Context, id int64) (*model.User, error)
	UpdateProfile(ctx context.Context, id int64, displayName, bio, avatarURL string) (*model.User, error)
}

type authService struct {
	userRepo repository.UserRepository
	cfg      *config.Config
}

func NewAuthService(userRepo repository.UserRepository, cfg *config.Config) AuthService {
	return &authService{userRepo: userRepo, cfg: cfg}
}

func (s *authService) Register(ctx context.Context, username, email, plainPassword string) (*model.User, *jwt.TokenPair, error) {
	// Check existing user
	existing, _ := s.userRepo.GetByEmail(ctx, email)
	if existing != nil {
		return nil, nil, ErrUserExists
	}
	existing, _ = s.userRepo.GetByUsername(ctx, username)
	if existing != nil {
		return nil, nil, ErrUserExists
	}

	// Hash password
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

	// Generate tokens
	tokens, err := jwt.GenerateTokenPair(
		user.ID, user.Username, user.Role,
		s.cfg.JWT.Secret, s.cfg.JWT.AccessExpiry, s.cfg.JWT.RefreshExpiry,
	)
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

	tokens, err := jwt.GenerateTokenPair(
		user.ID, user.Username, user.Role,
		s.cfg.JWT.Secret, s.cfg.JWT.AccessExpiry, s.cfg.JWT.RefreshExpiry,
	)
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

	return jwt.GenerateTokenPair(
		user.ID, user.Username, user.Role,
		s.cfg.JWT.Secret, s.cfg.JWT.AccessExpiry, s.cfg.JWT.RefreshExpiry,
	)
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
