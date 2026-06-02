package model

import (
	"testing"
	"time"

	"github.com/airoa-org/yubi-app/backend/internal/gen/openapi"
)

func TestInitEpisodeSubTask(t *testing.T) {
	tests := []struct {
		name           string
		organizationID string
		episodeID      string
		subtaskID      string
		wantErr        bool
	}{
		{
			name:           "success with valid inputs",
			organizationID: "550e8400-e29b-41d4-a716-446655440001",
			episodeID:      "550e8400-e29b-41d4-a716-446655440002",
			subtaskID:      "550e8400-e29b-41d4-a716-446655440003",
			wantErr:        false,
		},
		{
			name:           "error when organization_id is empty",
			organizationID: "",
			episodeID:      "550e8400-e29b-41d4-a716-446655440002",
			subtaskID:      "550e8400-e29b-41d4-a716-446655440003",
			wantErr:        true,
		},
		{
			name:           "error when episode_id is empty",
			organizationID: "550e8400-e29b-41d4-a716-446655440001",
			episodeID:      "",
			subtaskID:      "550e8400-e29b-41d4-a716-446655440003",
			wantErr:        true,
		},
		{
			name:           "error when subtask_id is empty",
			organizationID: "550e8400-e29b-41d4-a716-446655440001",
			episodeID:      "550e8400-e29b-41d4-a716-446655440002",
			subtaskID:      "",
			wantErr:        true,
		},
		{
			name:           "error when all fields are empty",
			organizationID: "",
			episodeID:      "",
			subtaskID:      "",
			wantErr:        true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got, err := InitEpisodeSubTask(tt.organizationID, tt.episodeID, tt.subtaskID)

			if tt.wantErr {
				if err == nil {
					t.Errorf("InitEpisodeSubTask() error = nil, wantErr %v", tt.wantErr)
				}
				return
			}
			if err != nil {
				t.Errorf("InitEpisodeSubTask() error = %v, wantErr %v", err, tt.wantErr)
				return
			}
			if got.IDNatural == "" {
				t.Errorf("InitEpisodeSubTask() IDNatural is empty")
			}
			if got.OrganizationID != tt.organizationID {
				t.Errorf("InitEpisodeSubTask() OrganizationID = %v, want %v", got.OrganizationID, tt.organizationID)
			}
			if got.EpisodeID != tt.episodeID {
				t.Errorf("InitEpisodeSubTask() EpisodeID = %v, want %v", got.EpisodeID, tt.episodeID)
			}
			if got.SubTaskID != tt.subtaskID {
				t.Errorf("InitEpisodeSubTask() SubTaskID = %v, want %v", got.SubTaskID, tt.subtaskID)
			}
			if got.CollectionStatus != openapi.SubTaskCollectionStatusReady {
				t.Errorf("InitEpisodeSubTask() CollectionStatus = %v, want %v", got.CollectionStatus, openapi.SubTaskCollectionStatusReady)
			}
			if got.CreatedAt.IsZero() {
				t.Errorf("InitEpisodeSubTask() CreatedAt is zero")
			}
		})
	}
}

func TestNewEpisodeSubTask(t *testing.T) {
	now := time.Now()
	updatedAt := now

	tests := []struct {
		name             string
		id               int64
		idNatural        string
		organizationID   string
		episodeID        string
		subtaskID        string
		collectionStatus openapi.SubTaskCollectionStatus
		createdAt        time.Time
		updatedAt        *time.Time
	}{
		{
			name:             "create with all fields",
			id:               1,
			idNatural:        "550e8400-e29b-41d4-a716-446655440000",
			organizationID:   "550e8400-e29b-41d4-a716-446655440001",
			episodeID:        "550e8400-e29b-41d4-a716-446655440002",
			subtaskID:        "550e8400-e29b-41d4-a716-446655440003",
			collectionStatus: openapi.SubTaskCollectionStatusCompleted,
			createdAt:        now,
			updatedAt:        &updatedAt,
		},
		{
			name:             "create with nil updated_at",
			id:               2,
			idNatural:        "550e8400-e29b-41d4-a716-446655440004",
			organizationID:   "550e8400-e29b-41d4-a716-446655440005",
			episodeID:        "550e8400-e29b-41d4-a716-446655440006",
			subtaskID:        "550e8400-e29b-41d4-a716-446655440007",
			collectionStatus: openapi.SubTaskCollectionStatusReady,
			createdAt:        now,
			updatedAt:        nil,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := NewEpisodeSubTask(
				tt.id,
				tt.idNatural,
				tt.organizationID,
				tt.episodeID,
				tt.subtaskID,
				tt.collectionStatus,
				tt.createdAt,
				tt.updatedAt,
			)

			if got.ID != tt.id {
				t.Errorf("NewEpisodeSubTask() ID = %v, want %v", got.ID, tt.id)
			}
			if got.IDNatural != tt.idNatural {
				t.Errorf("NewEpisodeSubTask() IDNatural = %v, want %v", got.IDNatural, tt.idNatural)
			}
			if got.OrganizationID != tt.organizationID {
				t.Errorf("NewEpisodeSubTask() OrganizationID = %v, want %v", got.OrganizationID, tt.organizationID)
			}
			if got.EpisodeID != tt.episodeID {
				t.Errorf("NewEpisodeSubTask() EpisodeID = %v, want %v", got.EpisodeID, tt.episodeID)
			}
			if got.SubTaskID != tt.subtaskID {
				t.Errorf("NewEpisodeSubTask() SubTaskID = %v, want %v", got.SubTaskID, tt.subtaskID)
			}
			if got.CollectionStatus != tt.collectionStatus {
				t.Errorf("NewEpisodeSubTask() CollectionStatus = %v, want %v", got.CollectionStatus, tt.collectionStatus)
			}
			if got.CreatedAt != tt.createdAt {
				t.Errorf("NewEpisodeSubTask() CreatedAt = %v, want %v", got.CreatedAt, tt.createdAt)
			}
		})
	}
}

func newValidEpisodeSubTask() EpisodeSubTask {
	return EpisodeSubTask{
		IDNatural:        "550e8400-e29b-41d4-a716-446655440000",
		OrganizationID:   "550e8400-e29b-41d4-a716-446655440001",
		EpisodeID:        "550e8400-e29b-41d4-a716-446655440002",
		SubTaskID:        "550e8400-e29b-41d4-a716-446655440003",
		CollectionStatus: openapi.SubTaskCollectionStatusReady,
	}
}

func newEpisodeSubTaskWithStatus(status openapi.SubTaskCollectionStatus) EpisodeSubTask {
	est := newValidEpisodeSubTask()
	est.CollectionStatus = status
	return est
}

func TestEpisodeSubTask_StartProgress(t *testing.T) {
	tests := []struct {
		name          string
		initialStatus openapi.SubTaskCollectionStatus
		wantErr       bool
		wantStatus    openapi.SubTaskCollectionStatus
	}{
		{
			name:          "success: Ready → InProgress",
			initialStatus: openapi.SubTaskCollectionStatusReady,
			wantErr:       false,
			wantStatus:    openapi.SubTaskCollectionStatusInProgress,
		},
		{
			name:          "idempotent: InProgress → InProgress (no error)",
			initialStatus: openapi.SubTaskCollectionStatusInProgress,
			wantErr:       false,
			wantStatus:    openapi.SubTaskCollectionStatusInProgress,
		},
		{
			name:          "error: Completed → cannot start progress",
			initialStatus: openapi.SubTaskCollectionStatusCompleted,
			wantErr:       true,
		},
		{
			name:          "error: Cancelled → cannot start progress",
			initialStatus: openapi.SubTaskCollectionStatusCancelled,
			wantErr:       true,
		},
		{
			name:          "error: Skipped → cannot start progress",
			initialStatus: openapi.SubTaskCollectionStatusSkipped,
			wantErr:       true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			est := newEpisodeSubTaskWithStatus(tt.initialStatus)
			err := est.StartProgress()

			if tt.wantErr {
				if err == nil {
					t.Errorf("EpisodeSubTask.StartProgress() error = nil, wantErr %v", tt.wantErr)
				}
				return
			}
			if err != nil {
				t.Errorf("EpisodeSubTask.StartProgress() error = %v, wantErr %v", err, tt.wantErr)
				return
			}
			if est.CollectionStatus != tt.wantStatus {
				t.Errorf("EpisodeSubTask.StartProgress() CollectionStatus = %v, want %v", est.CollectionStatus, tt.wantStatus)
			}
		})
	}
}

func TestEpisodeSubTask_Complete(t *testing.T) {
	tests := []struct {
		name          string
		initialStatus openapi.SubTaskCollectionStatus
		wantErr       bool
		wantStatus    openapi.SubTaskCollectionStatus
	}{
		{
			name:          "success: Ready → Completed",
			initialStatus: openapi.SubTaskCollectionStatusReady,
			wantErr:       false,
			wantStatus:    openapi.SubTaskCollectionStatusCompleted,
		},
		{
			name:          "success: InProgress → Completed",
			initialStatus: openapi.SubTaskCollectionStatusInProgress,
			wantErr:       false,
			wantStatus:    openapi.SubTaskCollectionStatusCompleted,
		},
		{
			name:          "idempotent: Completed → Completed (no error)",
			initialStatus: openapi.SubTaskCollectionStatusCompleted,
			wantErr:       false,
			wantStatus:    openapi.SubTaskCollectionStatusCompleted,
		},
		{
			name:          "error: Cancelled → cannot complete",
			initialStatus: openapi.SubTaskCollectionStatusCancelled,
			wantErr:       true,
		},
		{
			name:          "error: Skipped → cannot complete",
			initialStatus: openapi.SubTaskCollectionStatusSkipped,
			wantErr:       true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			est := newEpisodeSubTaskWithStatus(tt.initialStatus)
			err := est.Complete()

			if tt.wantErr {
				if err == nil {
					t.Errorf("EpisodeSubTask.Complete() error = nil, wantErr %v", tt.wantErr)
				}
				return
			}
			if err != nil {
				t.Errorf("EpisodeSubTask.Complete() error = %v, wantErr %v", err, tt.wantErr)
				return
			}
			if est.CollectionStatus != tt.wantStatus {
				t.Errorf("EpisodeSubTask.Complete() CollectionStatus = %v, want %v", est.CollectionStatus, tt.wantStatus)
			}
		})
	}
}

func TestEpisodeSubTask_Skip(t *testing.T) {
	tests := []struct {
		name          string
		initialStatus openapi.SubTaskCollectionStatus
		wantErr       bool
		wantStatus    openapi.SubTaskCollectionStatus
	}{
		{
			name:          "success: Ready → Skipped",
			initialStatus: openapi.SubTaskCollectionStatusReady,
			wantErr:       false,
			wantStatus:    openapi.SubTaskCollectionStatusSkipped,
		},
		{
			name:          "success: InProgress → Skipped",
			initialStatus: openapi.SubTaskCollectionStatusInProgress,
			wantErr:       false,
			wantStatus:    openapi.SubTaskCollectionStatusSkipped,
		},
		{
			name:          "idempotent: Skipped → Skipped (no error)",
			initialStatus: openapi.SubTaskCollectionStatusSkipped,
			wantErr:       false,
			wantStatus:    openapi.SubTaskCollectionStatusSkipped,
		},
		{
			name:          "error: Cancelled → cannot skip",
			initialStatus: openapi.SubTaskCollectionStatusCancelled,
			wantErr:       true,
		},
		{
			name:          "error: Completed → cannot skip",
			initialStatus: openapi.SubTaskCollectionStatusCompleted,
			wantErr:       true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			est := newEpisodeSubTaskWithStatus(tt.initialStatus)
			err := est.Skip()

			if tt.wantErr {
				if err == nil {
					t.Errorf("EpisodeSubTask.Skip() error = nil, wantErr %v", tt.wantErr)
				}
				return
			}
			if err != nil {
				t.Errorf("EpisodeSubTask.Skip() error = %v, wantErr %v", err, tt.wantErr)
				return
			}
			if est.CollectionStatus != tt.wantStatus {
				t.Errorf("EpisodeSubTask.Skip() CollectionStatus = %v, want %v", est.CollectionStatus, tt.wantStatus)
			}
		})
	}
}

func TestEpisodeSubTask_Cancel(t *testing.T) {
	tests := []struct {
		name          string
		initialStatus openapi.SubTaskCollectionStatus
		wantErr       bool
		wantStatus    openapi.SubTaskCollectionStatus
	}{
		{
			name:          "success: Ready → Cancelled",
			initialStatus: openapi.SubTaskCollectionStatusReady,
			wantErr:       false,
			wantStatus:    openapi.SubTaskCollectionStatusCancelled,
		},
		{
			name:          "success: InProgress → Cancelled",
			initialStatus: openapi.SubTaskCollectionStatusInProgress,
			wantErr:       false,
			wantStatus:    openapi.SubTaskCollectionStatusCancelled,
		},
		{
			name:          "success: Skipped → Cancelled",
			initialStatus: openapi.SubTaskCollectionStatusSkipped,
			wantErr:       false,
			wantStatus:    openapi.SubTaskCollectionStatusCancelled,
		},
		{
			name:          "idempotent: Cancelled → Cancelled (no error)",
			initialStatus: openapi.SubTaskCollectionStatusCancelled,
			wantErr:       false,
			wantStatus:    openapi.SubTaskCollectionStatusCancelled,
		},
		{
			name:          "error: Completed → cannot cancel",
			initialStatus: openapi.SubTaskCollectionStatusCompleted,
			wantErr:       true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			est := newEpisodeSubTaskWithStatus(tt.initialStatus)
			err := est.Cancel()

			if tt.wantErr {
				if err == nil {
					t.Errorf("EpisodeSubTask.Cancel() error = nil, wantErr %v", tt.wantErr)
				}
				return
			}
			if err != nil {
				t.Errorf("EpisodeSubTask.Cancel() error = %v, wantErr %v", err, tt.wantErr)
				return
			}
			if est.CollectionStatus != tt.wantStatus {
				t.Errorf("EpisodeSubTask.Cancel() CollectionStatus = %v, want %v", est.CollectionStatus, tt.wantStatus)
			}
		})
	}
}
