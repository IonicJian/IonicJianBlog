package repository

import (
	"context"

	"github.com/jackc/pgx/v5/pgxpool"
)

type LikeRepository interface {
	Toggle(ctx context.Context, userID int64, targetType string, targetID int64) (bool, error)
	Count(ctx context.Context, targetType string, targetID int64) (int64, error)
	IsLiked(ctx context.Context, userID int64, targetType string, targetID int64) (bool, error)
}

type likeRepo struct {
	db *pgxpool.Pool
}

func NewLikeRepository(db *pgxpool.Pool) LikeRepository {
	return &likeRepo{db: db}
}

func (r *likeRepo) Toggle(ctx context.Context, userID int64, targetType string, targetID int64) (bool, error) {
	// Try to insert; if conflict, delete
	tag, err := r.db.Exec(ctx,
		`INSERT INTO likes (user_id, target_type, target_id) VALUES ($1, $2, $3)
		 ON CONFLICT (user_id, target_type, target_id) DO NOTHING`,
		userID, targetType, targetID,
	)
	if err != nil {
		return false, err
	}

	if tag.RowsAffected() > 0 {
		return true, nil // liked
	}

	// Already liked, so remove (unlike)
	_, err = r.db.Exec(ctx,
		"DELETE FROM likes WHERE user_id=$1 AND target_type=$2 AND target_id=$3",
		userID, targetType, targetID,
	)
	if err != nil {
		return false, err
	}
	return false, nil // unliked
}

func (r *likeRepo) Count(ctx context.Context, targetType string, targetID int64) (int64, error) {
	var count int64
	err := r.db.QueryRow(ctx,
		"SELECT COUNT(*) FROM likes WHERE target_type=$1 AND target_id=$2",
		targetType, targetID,
	).Scan(&count)
	return count, err
}

func (r *likeRepo) IsLiked(ctx context.Context, userID int64, targetType string, targetID int64) (bool, error) {
	var exists bool
	err := r.db.QueryRow(ctx,
		"SELECT EXISTS(SELECT 1 FROM likes WHERE user_id=$1 AND target_type=$2 AND target_id=$3)",
		userID, targetType, targetID,
	).Scan(&exists)
	return exists, err
}
