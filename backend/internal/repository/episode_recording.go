package repository

import (
	"context"

	"github.com/airoa-org/yubi-app/backend/internal/domain/model"
)

type EpisodeRecording interface {
	GetRecordingURLs(ctx context.Context, path model.EpisodePreviewPath) (map[string]string, error)
	GetStats(ctx context.Context, path model.EpisodePreviewPath) (model.EpisodeRecordingStats, error)
}
