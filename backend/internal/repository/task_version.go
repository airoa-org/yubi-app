package repository

import (
	"context"

	"github.com/airoa-org/yubi-app/backend/internal/domain/model"
)

type TaskVersion interface {
	Create(ctx context.Context, conn DBConn, tv model.TaskVersion) (model.TaskVersion, error)
	GetByID(ctx context.Context, conn DBConn, id string) (model.TaskVersion, error)
	GetByIDForUpdate(ctx context.Context, conn DBConn, id string) (model.TaskVersion, error)
	GetLatestApprovedByTaskID(ctx context.Context, conn DBConn, taskID string) (model.TaskVersion, error)
	Update(ctx context.Context, conn DBConn, tv model.TaskVersion) (model.TaskVersion, error)
	Approve(ctx context.Context, conn DBConn, id string) (model.TaskVersion, error)
	ListByTaskID(ctx context.Context, conn DBConn, taskID string) (model.TaskVersions, error)
	ListByIDs(ctx context.Context, conn DBConn, ids []string) (model.TaskVersions, error)
	UpdateParameters(ctx context.Context, conn DBConn, id string, parameters []model.TaskVersionParameter) (model.TaskVersion, error)
	// SumTargetByTaskID returns the total target_duration_seconds across all approved
	// task versions for the given task. Null targets are treated as 0.
	SumTargetByTaskID(ctx context.Context, conn DBConn, taskID string) (int64, error)
}
