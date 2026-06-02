package model

import (
	"time"
)

// AggregationPeriod represents the period type for aggregation
type AggregationPeriod string

const (
	AggregationPeriodHourly  AggregationPeriod = "hourly"
	AggregationPeriodDaily   AggregationPeriod = "daily"
	AggregationPeriodMonthly AggregationPeriod = "monthly"
)

// EpisodeStats represents aggregated episode statistics
type EpisodeStats struct {
	ID                   int64
	IDNatural            string
	OrganizationID       string
	LocationID           string
	RobotID              string
	PeriodStart          time.Time
	TotalDurationSeconds int64
	EpisodeCount         int
	CreatedAt            time.Time
	UpdatedAt            time.Time
}

type EpisodeStatsList []*EpisodeStats

// NewEpisodeStats creates a new EpisodeStats instance
func NewEpisodeStats(
	organizationID,
	locationID,
	robotID string,
	periodStart time.Time,
	totalDurationSeconds int64,
	episodeCount int,
) (EpisodeStats, error) {
	idNatural, err := InitID()
	if err != nil {
		return EpisodeStats{}, err
	}

	return EpisodeStats{
		IDNatural:            idNatural,
		OrganizationID:       organizationID,
		LocationID:           locationID,
		RobotID:              robotID,
		PeriodStart:          periodStart,
		TotalDurationSeconds: totalDurationSeconds,
		EpisodeCount:         episodeCount,
		CreatedAt:            time.Now(),
		UpdatedAt:            time.Now(),
	}, nil
}

// TotalDurationHours returns the total duration in hours
func (e EpisodeStats) TotalDurationHours() float64 {
	return float64(e.TotalDurationSeconds) / 3600.0
}

// AggregatedEpisodeData represents raw aggregation data from database
type AggregatedEpisodeData struct {
	OrganizationID       string
	LocationID           string
	RobotID              string
	TotalDurationSeconds int64
	EpisodeCount         int
}

// AggregatedTaskVersionData represents raw aggregation data per task version
type AggregatedTaskVersionData struct {
	TaskVersionID        string
	TotalDurationSeconds int64
	EpisodeCount         int
}

// TaskVersionStats represents aggregated stats for a task version (all-time cumulative)
type TaskVersionStats struct {
	ID                   int64
	IDNatural            string
	TaskVersionID        string
	TotalDurationSeconds int64
	EpisodeCount         int
	CreatedAt            time.Time
	UpdatedAt            time.Time
}
