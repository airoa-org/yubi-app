package repository

import (
	"context"
	"time"
)

// RobotUptimeDeltaRepository manages per-robot uptime accumulation buffers in Redis.
// Deltas are written on each heartbeat and flushed to PostgreSQL periodically.
type RobotUptimeDeltaRepository interface {
	// IncrBy adds seconds to the robot's uptime buffer.
	// periodStart is derived from the heartbeat's ReportedAt (truncated to the hour)
	// and is stored alongside the delta so flushes write to the correct hour bucket.
	IncrBy(ctx context.Context, robotID string, seconds int64, periodStart time.Time) error
	// Get reads the accumulated seconds and the associated period_start without
	// modifying Redis. Call Delete after a successful DB write.
	Get(ctx context.Context, robotID string) (seconds int64, periodStart time.Time, err error)
	// Delete removes the robot's uptime buffer from Redis.
	// Must be called only after WriteBatch succeeds to avoid data loss on DB failure.
	Delete(ctx context.Context, robotID string) error
}
