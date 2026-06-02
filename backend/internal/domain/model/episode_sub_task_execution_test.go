package model

import (
	"testing"
	"time"

	"github.com/airoa-org/yubi-app/backend/internal/gen/openapi"
)

func TestInitEpisodeSubTaskExecution(t *testing.T) {
	tests := []struct {
		name             string
		organizationID   string
		episodeSubTaskID string
		wantErr          bool
	}{
		{
			name:             "success with valid inputs",
			organizationID:   "550e8400-e29b-41d4-a716-446655440001",
			episodeSubTaskID: "550e8400-e29b-41d4-a716-446655440002",
			wantErr:          false,
		},
		{
			name:             "error when organization_id is empty",
			organizationID:   "",
			episodeSubTaskID: "550e8400-e29b-41d4-a716-446655440002",
			wantErr:          true,
		},
		{
			name:             "error when episode_sub_task_id is empty",
			organizationID:   "550e8400-e29b-41d4-a716-446655440001",
			episodeSubTaskID: "",
			wantErr:          true,
		},
		{
			name:             "error when all fields are empty",
			organizationID:   "",
			episodeSubTaskID: "",
			wantErr:          true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got, err := InitEpisodeSubTaskExecution(tt.organizationID, tt.episodeSubTaskID)

			if tt.wantErr {
				if err == nil {
					t.Errorf("InitEpisodeSubTaskExecution() error = nil, wantErr %v", tt.wantErr)
				}
				return
			}
			if err != nil {
				t.Errorf("InitEpisodeSubTaskExecution() error = %v, wantErr %v", err, tt.wantErr)
				return
			}
			if got.IDNatural == "" {
				t.Errorf("InitEpisodeSubTaskExecution() IDNatural is empty")
			}
			if got.OrganizationID != tt.organizationID {
				t.Errorf("InitEpisodeSubTaskExecution() OrganizationID = %v, want %v", got.OrganizationID, tt.organizationID)
			}
			if got.EpisodeSubTaskID != tt.episodeSubTaskID {
				t.Errorf("InitEpisodeSubTaskExecution() EpisodeSubTaskID = %v, want %v", got.EpisodeSubTaskID, tt.episodeSubTaskID)
			}
			if got.ExecutionStatus != openapi.ExecutionStatusReady {
				t.Errorf("InitEpisodeSubTaskExecution() ExecutionStatus = %v, want %v", got.ExecutionStatus, openapi.ExecutionStatusReady)
			}
			if got.CreatedAt.IsZero() {
				t.Errorf("InitEpisodeSubTaskExecution() CreatedAt is zero")
			}
		})
	}
}

func TestNewEpisodeSubTaskExecution(t *testing.T) {
	now := time.Now()
	startedAt := now.Add(-time.Hour)
	finishedAt := now
	updatedAt := now

	tests := []struct {
		name             string
		id               int64
		idNatural        string
		organizationID   string
		episodeSubTaskID string
		executionStatus  openapi.ExecutionStatus
		startedAt        *time.Time
		finishedAt       *time.Time
		createdAt        time.Time
		updatedAt        *time.Time
	}{
		{
			name:             "create with all fields",
			id:               1,
			idNatural:        "550e8400-e29b-41d4-a716-446655440000",
			organizationID:   "550e8400-e29b-41d4-a716-446655440001",
			episodeSubTaskID: "550e8400-e29b-41d4-a716-446655440002",
			executionStatus:  openapi.ExecutionStatusFinished,
			startedAt:        &startedAt,
			finishedAt:       &finishedAt,
			createdAt:        now,
			updatedAt:        &updatedAt,
		},
		{
			name:             "create with nil optional fields",
			id:               2,
			idNatural:        "550e8400-e29b-41d4-a716-446655440003",
			organizationID:   "550e8400-e29b-41d4-a716-446655440004",
			episodeSubTaskID: "550e8400-e29b-41d4-a716-446655440005",
			executionStatus:  openapi.ExecutionStatusReady,
			startedAt:        nil,
			finishedAt:       nil,
			createdAt:        now,
			updatedAt:        nil,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := NewEpisodeSubTaskExecution(
				tt.id,
				tt.idNatural,
				tt.organizationID,
				tt.episodeSubTaskID,
				tt.executionStatus,
				tt.startedAt,
				tt.finishedAt,
				tt.createdAt,
				tt.updatedAt,
			)

			if got.ID != tt.id {
				t.Errorf("NewEpisodeSubTaskExecution() ID = %v, want %v", got.ID, tt.id)
			}
			if got.IDNatural != tt.idNatural {
				t.Errorf("NewEpisodeSubTaskExecution() IDNatural = %v, want %v", got.IDNatural, tt.idNatural)
			}
			if got.OrganizationID != tt.organizationID {
				t.Errorf("NewEpisodeSubTaskExecution() OrganizationID = %v, want %v", got.OrganizationID, tt.organizationID)
			}
			if got.EpisodeSubTaskID != tt.episodeSubTaskID {
				t.Errorf("NewEpisodeSubTaskExecution() EpisodeSubTaskID = %v, want %v", got.EpisodeSubTaskID, tt.episodeSubTaskID)
			}
			if got.ExecutionStatus != tt.executionStatus {
				t.Errorf("NewEpisodeSubTaskExecution() ExecutionStatus = %v, want %v", got.ExecutionStatus, tt.executionStatus)
			}
			if got.CreatedAt != tt.createdAt {
				t.Errorf("NewEpisodeSubTaskExecution() CreatedAt = %v, want %v", got.CreatedAt, tt.createdAt)
			}
		})
	}
}

func newValidEpisodeSubTaskExecution() EpisodeSubTaskExecution {
	return EpisodeSubTaskExecution{
		IDNatural:        "550e8400-e29b-41d4-a716-446655440000",
		OrganizationID:   "550e8400-e29b-41d4-a716-446655440001",
		EpisodeSubTaskID: "550e8400-e29b-41d4-a716-446655440002",
		ExecutionStatus:  openapi.ExecutionStatusReady,
	}
}

func newExecutionWithStatus(status openapi.ExecutionStatus) EpisodeSubTaskExecution {
	exe := newValidEpisodeSubTaskExecution()
	exe.ExecutionStatus = status
	return exe
}

func TestEpisodeSubTaskExecution_Start(t *testing.T) {
	now := time.Now()

	tests := []struct {
		name          string
		initialStatus openapi.ExecutionStatus
		occurredAt    time.Time
		wantErr       bool
		wantStatus    openapi.ExecutionStatus
	}{
		{
			name:          "success: Ready → Started",
			initialStatus: openapi.ExecutionStatusReady,
			occurredAt:    now,
			wantErr:       false,
			wantStatus:    openapi.ExecutionStatusStarted,
		},
		{
			name:          "error: Started → cannot start again",
			initialStatus: openapi.ExecutionStatusStarted,
			occurredAt:    now,
			wantErr:       true,
		},
		{
			name:          "error: Finished → cannot start",
			initialStatus: openapi.ExecutionStatusFinished,
			occurredAt:    now,
			wantErr:       true,
		},
		{
			name:          "error: Cancelled → cannot start",
			initialStatus: openapi.ExecutionStatusCancelled,
			occurredAt:    now,
			wantErr:       true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			exe := newExecutionWithStatus(tt.initialStatus)
			err := exe.Start(tt.occurredAt)

			if tt.wantErr {
				if err == nil {
					t.Errorf("EpisodeSubTaskExecution.Start() error = nil, wantErr %v", tt.wantErr)
				}
				return
			}
			if err != nil {
				t.Errorf("EpisodeSubTaskExecution.Start() error = %v, wantErr %v", err, tt.wantErr)
				return
			}
			if exe.ExecutionStatus != tt.wantStatus {
				t.Errorf("EpisodeSubTaskExecution.Start() ExecutionStatus = %v, want %v", exe.ExecutionStatus, tt.wantStatus)
			}
			if exe.StartedAt == nil {
				t.Errorf("EpisodeSubTaskExecution.Start() StartedAt is nil")
			} else if !exe.StartedAt.Equal(tt.occurredAt) {
				t.Errorf("EpisodeSubTaskExecution.Start() StartedAt = %v, want %v", *exe.StartedAt, tt.occurredAt)
			}
		})
	}
}

func TestEpisodeSubTaskExecution_Finish(t *testing.T) {
	now := time.Now()

	tests := []struct {
		name          string
		initialStatus openapi.ExecutionStatus
		occurredAt    time.Time
		wantErr       bool
		wantStatus    openapi.ExecutionStatus
	}{
		{
			name:          "success: Started → Finished",
			initialStatus: openapi.ExecutionStatusStarted,
			occurredAt:    now,
			wantErr:       false,
			wantStatus:    openapi.ExecutionStatusFinished,
		},
		{
			name:          "error: Ready → cannot finish",
			initialStatus: openapi.ExecutionStatusReady,
			occurredAt:    now,
			wantErr:       true,
		},
		{
			name:          "error: Finished → cannot finish again",
			initialStatus: openapi.ExecutionStatusFinished,
			occurredAt:    now,
			wantErr:       true,
		},
		{
			name:          "error: Cancelled → cannot finish",
			initialStatus: openapi.ExecutionStatusCancelled,
			occurredAt:    now,
			wantErr:       true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			exe := newExecutionWithStatus(tt.initialStatus)
			err := exe.Finish(tt.occurredAt)

			if tt.wantErr {
				if err == nil {
					t.Errorf("EpisodeSubTaskExecution.Finish() error = nil, wantErr %v", tt.wantErr)
				}
				return
			}
			if err != nil {
				t.Errorf("EpisodeSubTaskExecution.Finish() error = %v, wantErr %v", err, tt.wantErr)
				return
			}
			if exe.ExecutionStatus != tt.wantStatus {
				t.Errorf("EpisodeSubTaskExecution.Finish() ExecutionStatus = %v, want %v", exe.ExecutionStatus, tt.wantStatus)
			}
			if exe.FinishedAt == nil {
				t.Errorf("EpisodeSubTaskExecution.Finish() FinishedAt is nil")
			} else if !exe.FinishedAt.Equal(tt.occurredAt) {
				t.Errorf("EpisodeSubTaskExecution.Finish() FinishedAt = %v, want %v", *exe.FinishedAt, tt.occurredAt)
			}
		})
	}
}

func TestEpisodeSubTaskExecution_Cancel(t *testing.T) {
	tests := []struct {
		name          string
		initialStatus openapi.ExecutionStatus
		wantErr       bool
		wantStatus    openapi.ExecutionStatus
	}{
		{
			name:          "success: Ready → Cancelled",
			initialStatus: openapi.ExecutionStatusReady,
			wantErr:       false,
			wantStatus:    openapi.ExecutionStatusCancelled,
		},
		{
			name:          "success: Started → Cancelled",
			initialStatus: openapi.ExecutionStatusStarted,
			wantErr:       false,
			wantStatus:    openapi.ExecutionStatusCancelled,
		},
		{
			name:          "idempotent: Cancelled → Cancelled (no error)",
			initialStatus: openapi.ExecutionStatusCancelled,
			wantErr:       false,
			wantStatus:    openapi.ExecutionStatusCancelled,
		},
		{
			name:          "error: Finished → cannot cancel",
			initialStatus: openapi.ExecutionStatusFinished,
			wantErr:       true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			exe := newExecutionWithStatus(tt.initialStatus)
			err := exe.Cancel()

			if tt.wantErr {
				if err == nil {
					t.Errorf("EpisodeSubTaskExecution.Cancel() error = nil, wantErr %v", tt.wantErr)
				}
				return
			}
			if err != nil {
				t.Errorf("EpisodeSubTaskExecution.Cancel() error = %v, wantErr %v", err, tt.wantErr)
				return
			}
			if exe.ExecutionStatus != tt.wantStatus {
				t.Errorf("EpisodeSubTaskExecution.Cancel() ExecutionStatus = %v, want %v", exe.ExecutionStatus, tt.wantStatus)
			}
		})
	}
}
