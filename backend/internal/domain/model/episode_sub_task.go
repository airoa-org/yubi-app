package model

import (
	"time"

	"github.com/airoa-org/yubi-app/backend/internal/apperror"
	"github.com/airoa-org/yubi-app/backend/internal/gen/openapi"
	validation "github.com/go-ozzo/ozzo-validation/v4"
)

type EpisodeSubTask struct {
	ID               int64
	IDNatural        string
	OrganizationID   string
	EpisodeID        string
	SubTaskID        string
	CollectionStatus openapi.SubTaskCollectionStatus
	CreatedAt        time.Time
	UpdatedAt        *time.Time
}

type EpisodeSubTasks []*EpisodeSubTask

func InitEpisodeSubTask(organizationID, episodeID, subtaskID string) (EpisodeSubTask, error) {
	idNatural, err := InitID()
	if err != nil {
		return EpisodeSubTask{}, err
	}

	est := EpisodeSubTask{
		IDNatural:        idNatural,
		OrganizationID:   organizationID,
		EpisodeID:        episodeID,
		SubTaskID:        subtaskID,
		CollectionStatus: openapi.SubTaskCollectionStatusReady,
		CreatedAt:        time.Now(),
	}

	if err := est.validate(); err != nil {
		return EpisodeSubTask{}, err
	}

	return est, nil
}

func NewEpisodeSubTask(
	id int64,
	idNatural,
	organizationID,
	episodeID,
	subtaskID string,
	collectionStatus openapi.SubTaskCollectionStatus,
	createdAt time.Time,
	updatedAt *time.Time,
) EpisodeSubTask {
	return EpisodeSubTask{
		ID:               id,
		IDNatural:        idNatural,
		OrganizationID:   organizationID,
		EpisodeID:        episodeID,
		SubTaskID:        subtaskID,
		CollectionStatus: collectionStatus,
		CreatedAt:        createdAt,
		UpdatedAt:        updatedAt,
	}
}

func (est EpisodeSubTask) validate() error {
	if err := (validation.Errors{
		"id_natural":      validation.Validate(est.IDNatural, validation.Required.Error("id_natural is required")),
		"organization_id": validation.Validate(est.OrganizationID, validation.Required.Error("organization_id is required")),
		"episode_id":      validation.Validate(est.EpisodeID, validation.Required.Error("episode_id is required")),
		"subtask_id":      validation.Validate(est.SubTaskID, validation.Required.Error("subtask_id is required")),
	}).Filter(); err != nil {
		return apperror.WrapWithMessage(err, apperror.NewMessage(apperror.CodeValidationError, "episode_sub_task validation failed: %v", err))
	}
	return nil
}

func (est *EpisodeSubTask) CanStartProgress() error {
	if est.CollectionStatus != openapi.SubTaskCollectionStatusReady {
		return apperror.NewError(
			apperror.NewMessage(apperror.CodeConflict, "subtask status must be Ready to start progress, current: %v", est.CollectionStatus),
		)
	}
	return nil
}

func (est *EpisodeSubTask) StartProgress() error {
	if est.CollectionStatus == openapi.SubTaskCollectionStatusInProgress {
		return nil // Already in progress
	}
	if err := est.CanStartProgress(); err != nil {
		return err
	}
	est.CollectionStatus = openapi.SubTaskCollectionStatusInProgress
	return nil
}

func (est *EpisodeSubTask) Complete() error {
	if est.CollectionStatus == openapi.SubTaskCollectionStatusCompleted {
		return nil // Already completed
	}
	if est.CollectionStatus == openapi.SubTaskCollectionStatusCancelled ||
		est.CollectionStatus == openapi.SubTaskCollectionStatusSkipped {
		return apperror.NewError(
			apperror.NewMessage(apperror.CodeConflict, "cannot complete subtask with status: %v", est.CollectionStatus),
		)
	}
	est.CollectionStatus = openapi.SubTaskCollectionStatusCompleted
	return nil
}

func (est *EpisodeSubTask) Skip() error {
	if est.CollectionStatus == openapi.SubTaskCollectionStatusSkipped {
		return nil // Already skipped
	}
	if est.CollectionStatus == openapi.SubTaskCollectionStatusCancelled ||
		est.CollectionStatus == openapi.SubTaskCollectionStatusCompleted {
		return apperror.NewError(
			apperror.NewMessage(apperror.CodeConflict, "cannot skip subtask with status: %v", est.CollectionStatus),
		)
	}
	est.CollectionStatus = openapi.SubTaskCollectionStatusSkipped
	return nil
}

func (est *EpisodeSubTask) Cancel() error {
	if est.CollectionStatus == openapi.SubTaskCollectionStatusCancelled {
		return nil // Already cancelled
	}
	if est.CollectionStatus == openapi.SubTaskCollectionStatusCompleted {
		return apperror.NewError(
			apperror.NewMessage(apperror.CodeConflict, "cannot cancel completed subtask"),
		)
	}
	est.CollectionStatus = openapi.SubTaskCollectionStatusCancelled
	return nil
}
