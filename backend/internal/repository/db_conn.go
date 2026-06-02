package repository

import (
	"github.com/uptrace/bun"
)

type DBConn interface {
	NewInsert() *bun.InsertQuery
	NewSelect() *bun.SelectQuery
	NewRaw(query string, args ...any) *bun.RawQuery
	NewUpdate() *bun.UpdateQuery
	NewDelete() *bun.DeleteQuery
}
