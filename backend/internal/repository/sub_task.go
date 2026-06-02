package repository

import (
	"context"

	"github.com/airoa-org/yubi-app/backend/internal/domain/model"
)

type SubTaskListFilter struct {
	TaskID        *string
	TaskVersionID *string
}

type SubTask interface {
	Create(ctx context.Context, conn DBConn, s model.SubTask) (model.SubTask, error)
	GetByID(ctx context.Context, conn DBConn, id string) (model.SubTask, error)
	GetByTaskVersionID(ctx context.Context, conn DBConn, taskVersionID string) (model.SubTasks, error)
	GetMaxOrderIndex(ctx context.Context, conn DBConn, taskVersionID string) (int, error)
	List(ctx context.Context, conn DBConn, filter SubTaskListFilter, limit, offset int) (model.SubTasks, int, error)
	Update(ctx context.Context, conn DBConn, s model.SubTask) (model.SubTask, error)
	UpdateOrderIndices(ctx context.Context, conn DBConn, ids []string) error
	Delete(ctx context.Context, conn DBConn, id string) error
}
