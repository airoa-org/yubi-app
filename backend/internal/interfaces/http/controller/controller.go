package controller

import (
	"encoding/json"

	"github.com/rs/zerolog"

	"github.com/airoa-org/yubi-app/backend/internal/gen/openapi"
	"github.com/airoa-org/yubi-app/backend/internal/usecase"
)

type controller struct {
	logger                     zerolog.Logger
	userUsecase                usecase.UserUsecase
	userImportUsecase          usecase.UserImportUsecase
	organizationUsecase        usecase.OrganizationUsecase
	siteUsecase                usecase.SiteUsecase
	locationUsecase            usecase.LocationUsecase
	robotUsecase               usecase.RobotUsecase
	robotDeviceUsecase         usecase.RobotDeviceUsecase
	taskUsecase                usecase.TaskUsecase
	taskVersionUsecase         usecase.TaskVersionUsecase
	taskTagUsecase             usecase.TaskTagUsecase
	taskImportUsecase          usecase.TaskImportUsecase
	taskExportUsecase          usecase.TaskExportUsecase
	subtaskUsecase             usecase.SubTaskUsecase
	episodeUsecase             usecase.EpisodeUsecase
	episodeGradeUsecase        usecase.EpisodeGradeUsecase
	episodeExportUsecase       usecase.EpisodeExportUsecase
	episodeSubTaskUsecase      usecase.EpisodeSubTaskUsecase
	episodeExecutionUsecase    usecase.EpisodeExecutionUsecase
	fleetUsecase               usecase.FleetUsecase
	robotOperatorUsecase       usecase.RobotOperatorUsecase
	operatorYieldExportUsecase usecase.OperatorYieldExportUsecase
	apiKeyUsecase              usecase.APIKeyUsecase
}

// Verify that controller implements StrictServerInterface
var _ openapi.StrictServerInterface = (*controller)(nil)

func NewController(
	logger zerolog.Logger,
	userUsecase usecase.UserUsecase,
	userImportUsecase usecase.UserImportUsecase,
	organizationUsecase usecase.OrganizationUsecase,
	siteUsecase usecase.SiteUsecase,
	locationUsecase usecase.LocationUsecase,
	robotUsecase usecase.RobotUsecase,
	robotDeviceUsecase usecase.RobotDeviceUsecase,
	taskUsecase usecase.TaskUsecase,
	taskVersionUsecase usecase.TaskVersionUsecase,
	taskTagUsecase usecase.TaskTagUsecase,
	taskImportUsecase usecase.TaskImportUsecase,
	taskExportUsecase usecase.TaskExportUsecase,
	subtaskUsecase usecase.SubTaskUsecase,
	episodeUsecase usecase.EpisodeUsecase,
	episodeGradeUsecase usecase.EpisodeGradeUsecase,
	episodeExportUsecase usecase.EpisodeExportUsecase,
	episodeSubTaskUsecase usecase.EpisodeSubTaskUsecase,
	episodeExecutionUsecase usecase.EpisodeExecutionUsecase,
	fleetUsecase usecase.FleetUsecase,
	robotOperatorUsecase usecase.RobotOperatorUsecase,
	operatorYieldExportUsecase usecase.OperatorYieldExportUsecase,
	apiKeyUsecase usecase.APIKeyUsecase,
) *controller {
	return &controller{
		logger:                     logger,
		userUsecase:                userUsecase,
		userImportUsecase:          userImportUsecase,
		organizationUsecase:        organizationUsecase,
		siteUsecase:                siteUsecase,
		locationUsecase:            locationUsecase,
		robotUsecase:               robotUsecase,
		robotDeviceUsecase:         robotDeviceUsecase,
		taskUsecase:                taskUsecase,
		taskVersionUsecase:         taskVersionUsecase,
		taskTagUsecase:             taskTagUsecase,
		taskImportUsecase:          taskImportUsecase,
		taskExportUsecase:          taskExportUsecase,
		subtaskUsecase:             subtaskUsecase,
		episodeUsecase:             episodeUsecase,
		episodeGradeUsecase:        episodeGradeUsecase,
		episodeExportUsecase:       episodeExportUsecase,
		episodeSubTaskUsecase:      episodeSubTaskUsecase,
		episodeExecutionUsecase:    episodeExecutionUsecase,
		fleetUsecase:               fleetUsecase,
		robotOperatorUsecase:       robotOperatorUsecase,
		operatorYieldExportUsecase: operatorYieldExportUsecase,
		apiKeyUsecase:              apiKeyUsecase,
	}
}

func mapPtrFromRawMessagePtr(b *json.RawMessage) *map[string]interface{} {
	if b == nil || len(*b) == 0 {
		return nil
	}
	var m map[string]interface{}
	if err := json.Unmarshal(*b, &m); err != nil {
		return nil
	}
	return &m
}
