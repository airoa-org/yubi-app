package ccontext

import (
	"context"

	"github.com/airoa-org/yubi-app/backend/internal/apperror"
	"github.com/airoa-org/yubi-app/backend/internal/gen/openapi"
)

type userRole struct{}

func SetUserRole(ctx context.Context, role openapi.UserRole) context.Context {
	return context.WithValue(ctx, userRole{}, role)
}

func IsExistUserRole(ctx context.Context) bool {
	return ctx.Value(userRole{}) != nil
}

func UserRole(ctx context.Context) (openapi.UserRole, error) {
	val := ctx.Value(userRole{})
	if val == nil {
		return 0, apperror.NewError(
			apperror.NewMessage(apperror.CodeBadRequest, "user role not found in context"),
		)
	}
	role, ok := val.(openapi.UserRole)
	if !ok {
		return 0, apperror.NewError(
			apperror.NewMessage(apperror.CodeInternal, "user role type assertion failed"),
		)
	}
	return role, nil
}
