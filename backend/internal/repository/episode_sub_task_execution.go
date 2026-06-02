package repository

import (
	"context"

	"github.com/airoa-org/yubi-app/backend/internal/domain/model"
)

type EpisodeSubTaskExecution interface {
	Create(ctx context.Context, conn DBConn, execution model.EpisodeSubTaskExecution) (model.EpisodeSubTaskExecution, error)
	GetByID(ctx context.Context, conn DBConn, id string) (model.EpisodeSubTaskExecution, error)
	GetByEpisodeSubTaskIDs(ctx context.Context, conn DBConn, ids []string) (model.EpisodeSubTaskExecutions, error)
	Update(ctx context.Context, conn DBConn, execution model.EpisodeSubTaskExecution) error
	CountStartedBySubTaskID(ctx context.Context, conn DBConn, episodeSubTaskID string) (int, error)
	BulkCancelByEpisodeID(ctx context.Context, conn DBConn, episodeID string) error
}
