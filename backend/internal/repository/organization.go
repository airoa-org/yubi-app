package repository

import (
	"context"

	"github.com/airoa-org/yubi-app/backend/internal/domain/model"
)

type Organization interface {
	Create(ctx context.Context, conn DBConn, org model.Organization) (model.Organization, error)
	GetByNaturalID(ctx context.Context, conn DBConn, idNatural string) (model.Organization, error)
	List(ctx context.Context, conn DBConn, limit, offset int) (model.Organizations, int, error)
	Update(ctx context.Context, conn DBConn, org model.Organization) (model.Organization, error)
	Delete(ctx context.Context, conn DBConn, idNatural string) error
}
