package repository

import (
	"context"
	"time"

	"github.com/airoa-org/yubi-app/backend/internal/domain/model"
)

type RobotStatus struct {
	RobotID    string            `json:"robot_id"`
	RobotType  string            `json:"robot_type"`
	ReportedAt time.Time         `json:"reported_at"`
	Status     RobotStatusDetail `json:"status"`
}

type RobotStatusDetail struct {
	Battery        BatteryStatus              `json:"battery"`
	Connection     ConnectionStatus           `json:"connection"`
	UptimeSec      float64                    `json:"uptime_sec"`
	Metrics        []RobotMetric              `json:"metrics"`
	GateConditions *model.GateConditionStatus `json:"gate_conditions,omitempty"`
}

type BatteryStatus struct {
	Pct      int  `json:"pct"`
	Charging bool `json:"charging"`
}

type ConnectionStatus struct {
	QualityPct int `json:"quality_pct"`
}

type RobotMetric struct {
	Name   string            `json:"name"`
	Type   string            `json:"type"`
	Unit   string            `json:"unit"`
	Value  any               `json:"value"`
	Labels map[string]string `json:"labels,omitempty"`
}

type RobotStatusRepository interface {
	Save(ctx context.Context, status RobotStatus) error
	GetByRobotID(ctx context.Context, robotID string) (*RobotStatus, error)
	GetByRobotIDs(ctx context.Context, robotIDs []string) (map[string]*RobotStatus, error)
	Delete(ctx context.Context, robotID string) error
	GetAllOnlineRobotIDs(ctx context.Context) ([]string, error)
}
