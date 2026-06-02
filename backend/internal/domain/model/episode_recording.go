package model

import "time"

// EpisodePreviewPath holds the fields needed to construct the canonical S3
// preview path that matches the canonical_path format used by the data pipeline.
type EpisodePreviewPath struct {
	UUID         string
	Organization string
	Site         string
	Location     string
	RobotType    string
	RobotID      string
	StartedAt    time.Time
}

type EpisodeFeatureStats struct {
	Min   []float64
	Max   []float64
	Mean  []float64
	Std   []float64
	Count int
}

type EpisodeRecordingStats map[string]EpisodeFeatureStats
