package repository

import (
	"context"

	"github.com/airoa-org/yubi-app/backend/internal/domain/model"
	"github.com/airoa-org/yubi-app/backend/internal/gen/openapi"
)

type LocationListFilter struct {
	SiteID    *string
	Search    *string
	SortBy    *openapi.ListLocationsParamsSortBy
	SortOrder *openapi.ListLocationsParamsSortOrder
}

type Location interface {
	Create(ctx context.Context, conn DBConn, loc model.Location) (model.Location, error)
	GetByID(ctx context.Context, conn DBConn, id string) (model.Location, error)
	List(ctx context.Context, conn DBConn, filter LocationListFilter, limit, offset int) (model.Locations, int, error)
	Update(ctx context.Context, conn DBConn, loc model.Location) (model.Location, error)
	Delete(ctx context.Context, conn DBConn, id string) error
}
