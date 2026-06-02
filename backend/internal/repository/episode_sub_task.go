package repository

import (
	"context"

	"github.com/airoa-org/yubi-app/backend/internal/domain/model"
)

type EpisodeSubTask interface {
	BulkCreate(ctx context.Context, conn DBConn, subtasks []model.EpisodeSubTask) error
	GetByID(ctx context.Context, conn DBConn, id string) (model.EpisodeSubTask, error)
	GetByEpisodeID(ctx context.Context, conn DBConn, episodeID string) (model.EpisodeSubTasks, error)
	Update(ctx context.Context, conn DBConn, subtask model.EpisodeSubTask) error
	BulkCancelByEpisodeID(ctx context.Context, conn DBConn, episodeID string) error
}
