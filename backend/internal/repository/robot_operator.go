package repository

import (
	"context"

	"github.com/airoa-org/yubi-app/backend/internal/domain/model"
)

type RobotOperatorRepository interface {
	Save(ctx context.Context, robotID string, operator model.RobotOperator) error
	SaveNX(ctx context.Context, robotID string, operator model.RobotOperator) (bool, error)
	GetByRobotID(ctx context.Context, robotID string) (*model.RobotOperator, error)
	Delete(ctx context.Context, robotID string) error
}
