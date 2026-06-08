package user

import (
	"context"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/zanelin/blog/internal/model"
)

type Repository interface {
	Create(ctx context.Context, user *model.User) error
	GetByID(ctx context.Context, id int64) (*model.User, error)
	GetByEmail(ctx context.Context, email string) (*model.User, error)
	GetByUsername(ctx context.Context, username string) (*model.User, error)
	GetByGithubID(ctx context.Context, githubID int64) (*model.User, error)
	Update(ctx context.Context, user *model.User) error
	SetRole(ctx context.Context, id int64, role string) error
	GetSiteOwner(ctx context.Context) (*model.User, error)
}

type userRepo struct {
	db *pgxpool.Pool
}

func New(db *pgxpool.Pool) Repository {
	return &userRepo{db: db}
}

func (r *userRepo) Create(ctx context.Context, user *model.User) error {
	return r.db.QueryRow(ctx,
		`INSERT INTO users (username, email, password_hash, display_name, avatar_url, bio, github_id, role)
		 VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
		 RETURNING id, created_at, updated_at`,
		user.Username, user.Email, user.PasswordHash, user.DisplayName,
		user.AvatarURL, user.Bio, user.GithubID, user.Role,
	).Scan(&user.ID, &user.CreatedAt, &user.UpdatedAt)
}

func (r *userRepo) GetByID(ctx context.Context, id int64) (*model.User, error) {
	user := &model.User{}
	err := r.db.QueryRow(ctx,
		`SELECT id, username, email, password_hash, display_name, avatar_url, bio,
		        github_id, role, is_active, created_at, updated_at
		 FROM users WHERE id = $1`, id,
	).Scan(
		&user.ID, &user.Username, &user.Email, &user.PasswordHash,
		&user.DisplayName, &user.AvatarURL, &user.Bio, &user.GithubID,
		&user.Role, &user.IsActive, &user.CreatedAt, &user.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}
	return user, nil
}

func (r *userRepo) GetByEmail(ctx context.Context, email string) (*model.User, error) {
	user := &model.User{}
	err := r.db.QueryRow(ctx,
		`SELECT id, username, email, password_hash, display_name, avatar_url, bio,
		        github_id, role, is_active, created_at, updated_at
		 FROM users WHERE email = $1`, email,
	).Scan(
		&user.ID, &user.Username, &user.Email, &user.PasswordHash,
		&user.DisplayName, &user.AvatarURL, &user.Bio, &user.GithubID,
		&user.Role, &user.IsActive, &user.CreatedAt, &user.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}
	return user, nil
}

func (r *userRepo) GetByUsername(ctx context.Context, username string) (*model.User, error) {
	user := &model.User{}
	err := r.db.QueryRow(ctx,
		`SELECT id, username, email, password_hash, display_name, avatar_url, bio,
		        github_id, role, is_active, created_at, updated_at
		 FROM users WHERE username = $1`, username,
	).Scan(
		&user.ID, &user.Username, &user.Email, &user.PasswordHash,
		&user.DisplayName, &user.AvatarURL, &user.Bio, &user.GithubID,
		&user.Role, &user.IsActive, &user.CreatedAt, &user.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}
	return user, nil
}

func (r *userRepo) GetByGithubID(ctx context.Context, githubID int64) (*model.User, error) {
	user := &model.User{}
	err := r.db.QueryRow(ctx,
		`SELECT id, username, email, password_hash, display_name, avatar_url, bio,
		        github_id, role, is_active, created_at, updated_at
		 FROM users WHERE github_id = $1`, githubID,
	).Scan(
		&user.ID, &user.Username, &user.Email, &user.PasswordHash,
		&user.DisplayName, &user.AvatarURL, &user.Bio, &user.GithubID,
		&user.Role, &user.IsActive, &user.CreatedAt, &user.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}
	return user, nil
}

func (r *userRepo) Update(ctx context.Context, user *model.User) error {
	user.UpdatedAt = time.Now()
	_, err := r.db.Exec(ctx,
		`UPDATE users SET display_name=$1, avatar_url=$2, bio=$3, updated_at=$4
		 WHERE id=$5`,
		user.DisplayName, user.AvatarURL, user.Bio, user.UpdatedAt, user.ID,
	)
	return err
}

func (r *userRepo) SetRole(ctx context.Context, id int64, role string) error {
	_, err := r.db.Exec(ctx, "UPDATE users SET role=$1, updated_at=NOW() WHERE id=$2", role, id)
	return err
}

func (r *userRepo) GetSiteOwner(ctx context.Context) (*model.User, error) {
	user := &model.User{}
	err := r.db.QueryRow(ctx,
		`SELECT id, username, email, password_hash, display_name, avatar_url, bio,
		 github_id, role, is_active, created_at, updated_at
		 FROM users WHERE role='admin' ORDER BY id LIMIT 1`).Scan(
		&user.ID, &user.Username, &user.Email, &user.PasswordHash,
		&user.DisplayName, &user.AvatarURL, &user.Bio, &user.GithubID,
		&user.Role, &user.IsActive, &user.CreatedAt, &user.UpdatedAt)
	if err != nil {
		return nil, err
	}
	return user, nil
}
