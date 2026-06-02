package controller

import (
	"context"

	"github.com/airoa-org/yubi-app/backend/internal/gen/openapi"
	"github.com/airoa-org/yubi-app/backend/internal/usecase"
)

func (c *controller) CompleteRobotSubTask(ctx context.Context, request openapi.CompleteRobotSubTaskRequestObject) (openapi.CompleteRobotSubTaskResponseObject, error) {
	input := usecase.SubTaskActionInput{
		EpisodeID: request.EpisodeId,
		SubTaskID: request.SubtaskId,
	}

	if err := c.episodeSubTaskUsecase.Complete(ctx, input); err != nil {
		return nil, err
	}

	return openapi.CompleteRobotSubTask200Response{}, nil
}

func (c *controller) SkipRobotSubTask(ctx context.Context, request openapi.SkipRobotSubTaskRequestObject) (openapi.SkipRobotSubTaskResponseObject, error) {
	input := usecase.SubTaskActionInput{
		EpisodeID: request.EpisodeId,
		SubTaskID: request.SubtaskId,
	}

	if err := c.episodeSubTaskUsecase.Skip(ctx, input); err != nil {
		return nil, err
	}

	return openapi.SkipRobotSubTask200Response{}, nil
}
