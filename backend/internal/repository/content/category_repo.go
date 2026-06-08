package content

import (
	"context"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/zanelin/blog/internal/model"
)

type CategoryRepository interface {
	List(ctx context.Context) ([]*model.Category, error)
	GetByID(ctx context.Context, id int64) (*model.Category, error)
	Create(ctx context.Context, c *model.Category) error
	Update(ctx context.Context, c *model.Category) error
	Delete(ctx context.Context, id int64) error
}

type categoryRepo struct{ db *pgxpool.Pool }

func NewCategoryRepository(db *pgxpool.Pool) CategoryRepository { return &categoryRepo{db: db} }

func (r *categoryRepo) List(ctx context.Context) ([]*model.Category, error) {
	rows, err := r.db.Query(ctx, `SELECT id, name, slug, description, sort_order, parent_id, created_at FROM categories ORDER BY COALESCE(parent_id, id), sort_order, id`)
	if err != nil { return nil, err }
	defer rows.Close()
	var all []*model.Category
	for rows.Next() {
		c := &model.Category{}
		if err := rows.Scan(&c.ID, &c.Name, &c.Slug, &c.Description, &c.SortOrder, &c.ParentID, &c.CreatedAt); err != nil { return nil, err }
		all = append(all, c)
	}
	// Build tree: attach children to parents
	byID := make(map[int64]*model.Category)
	for _, c := range all { byID[c.ID] = c }
	var roots []*model.Category
	for _, c := range all {
		if c.ParentID != nil {
			if parent, ok := byID[*c.ParentID]; ok {
				parent.Children = append(parent.Children, c)
			}
		} else {
			roots = append(roots, c)
		}
	}
	return roots, nil
}

func (r *categoryRepo) GetByID(ctx context.Context, id int64) (*model.Category, error) {
	c := &model.Category{}
	err := r.db.QueryRow(ctx, "SELECT id, name, slug, description, sort_order, parent_id, created_at FROM categories WHERE id=$1", id).Scan(&c.ID, &c.Name, &c.Slug, &c.Description, &c.SortOrder, &c.ParentID, &c.CreatedAt)
	if err != nil { return nil, err }
	return c, nil
}

func (r *categoryRepo) Create(ctx context.Context, c *model.Category) error {
	return r.db.QueryRow(ctx, "INSERT INTO categories (name, slug, description, sort_order, parent_id) VALUES ($1,$2,$3,$4,$5) RETURNING id, created_at", c.Name, c.Slug, c.Description, c.SortOrder, c.ParentID).Scan(&c.ID, &c.CreatedAt)
}

func (r *categoryRepo) Update(ctx context.Context, c *model.Category) error {
	_, err := r.db.Exec(ctx, "UPDATE categories SET name=$1, slug=$2, description=$3, sort_order=$4, parent_id=$5 WHERE id=$6", c.Name, c.Slug, c.Description, c.SortOrder, c.ParentID, c.ID)
	return err
}

func (r *categoryRepo) Delete(ctx context.Context, id int64) error {
	_, err := r.db.Exec(ctx, "DELETE FROM categories WHERE id=$1", id)
	return err
}
