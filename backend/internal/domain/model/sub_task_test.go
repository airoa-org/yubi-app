package model

import (
	"strings"
	"testing"
)

func TestInitSubTask(t *testing.T) {
	description := "Test description"

	tests := []struct {
		name           string
		organizationID string
		taskVersionID  string
		subTaskName    string
		orderIndex     int
		description    *string
		wantErr        bool
	}{
		{
			name:           "success with valid inputs",
			organizationID: "550e8400-e29b-41d4-a716-446655440001",
			taskVersionID:  "550e8400-e29b-41d4-a716-446655440002",
			subTaskName:    "Test SubTask",
			orderIndex:     0,
			description:    &description,
			wantErr:        false,
		},
		{
			name:           "success with nil description",
			organizationID: "550e8400-e29b-41d4-a716-446655440001",
			taskVersionID:  "550e8400-e29b-41d4-a716-446655440002",
			subTaskName:    "Test SubTask",
			orderIndex:     0,
			description:    nil,
			wantErr:        false,
		},
		{
			name:           "success with positive order index",
			organizationID: "550e8400-e29b-41d4-a716-446655440001",
			taskVersionID:  "550e8400-e29b-41d4-a716-446655440002",
			subTaskName:    "Test SubTask",
			orderIndex:     5,
			description:    &description,
			wantErr:        false,
		},
		{
			name:           "error when organization_id is empty",
			organizationID: "",
			taskVersionID:  "550e8400-e29b-41d4-a716-446655440002",
			subTaskName:    "Test SubTask",
			orderIndex:     0,
			description:    &description,
			wantErr:        true,
		},
		{
			name:           "error when task_version_id is empty",
			organizationID: "550e8400-e29b-41d4-a716-446655440001",
			taskVersionID:  "",
			subTaskName:    "Test SubTask",
			orderIndex:     0,
			description:    &description,
			wantErr:        true,
		},
		{
			name:           "error when name is empty",
			organizationID: "550e8400-e29b-41d4-a716-446655440001",
			taskVersionID:  "550e8400-e29b-41d4-a716-446655440002",
			subTaskName:    "",
			orderIndex:     0,
			description:    &description,
			wantErr:        true,
		},
		{
			name:           "error when name exceeds 100 characters",
			organizationID: "550e8400-e29b-41d4-a716-446655440001",
			taskVersionID:  "550e8400-e29b-41d4-a716-446655440002",
			subTaskName:    strings.Repeat("a", 101),
			orderIndex:     0,
			description:    &description,
			wantErr:        true,
		},
		{
			name:           "success when name is exactly 100 characters",
			organizationID: "550e8400-e29b-41d4-a716-446655440001",
			taskVersionID:  "550e8400-e29b-41d4-a716-446655440002",
			subTaskName:    strings.Repeat("a", 100),
			orderIndex:     0,
			description:    &description,
			wantErr:        false,
		},
		{
			name:           "error when order_index is negative",
			organizationID: "550e8400-e29b-41d4-a716-446655440001",
			taskVersionID:  "550e8400-e29b-41d4-a716-446655440002",
			subTaskName:    "Test SubTask",
			orderIndex:     -1,
			description:    &description,
			wantErr:        true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got, err := InitSubTask(tt.organizationID, tt.taskVersionID, tt.subTaskName, tt.orderIndex, tt.description, nil)

			if tt.wantErr {
				if err == nil {
					t.Errorf("InitSubTask() error = nil, wantErr %v", tt.wantErr)
				}
				if got.IDNatural != "" {
					t.Errorf("InitSubTask() IDNatural = %v, want empty", got.IDNatural)
				}
				return
			}

			if err != nil {
				t.Errorf("InitSubTask() error = %v, wantErr %v", err, tt.wantErr)
				return
			}
			if got.IDNatural == "" {
				t.Errorf("InitSubTask() IDNatural is empty")
			}
			if got.OrganizationID != tt.organizationID {
				t.Errorf("InitSubTask() OrganizationID = %v, want %v", got.OrganizationID, tt.organizationID)
			}
			if got.TaskVersionID != tt.taskVersionID {
				t.Errorf("InitSubTask() TaskVersionID = %v, want %v", got.TaskVersionID, tt.taskVersionID)
			}
			if got.Name != tt.subTaskName {
				t.Errorf("InitSubTask() Name = %v, want %v", got.Name, tt.subTaskName)
			}
			if got.OrderIndex != tt.orderIndex {
				t.Errorf("InitSubTask() OrderIndex = %v, want %v", got.OrderIndex, tt.orderIndex)
			}
			if got.CreatedAt.IsZero() {
				t.Errorf("InitSubTask() CreatedAt is zero")
			}
		})
	}
}

func TestSubTask_validate(t *testing.T) {
	tests := []struct {
		name    string
		subTask SubTask
		wantErr bool
	}{
		{
			name: "valid with all required fields",
			subTask: SubTask{
				IDNatural:      "550e8400-e29b-41d4-a716-446655440000",
				OrganizationID: "550e8400-e29b-41d4-a716-446655440001",
				TaskVersionID:  "550e8400-e29b-41d4-a716-446655440002",
				Name:           "Test SubTask",
				OrderIndex:     0,
			},
			wantErr: false,
		},
		{
			name: "valid with positive order index",
			subTask: SubTask{
				IDNatural:      "550e8400-e29b-41d4-a716-446655440000",
				OrganizationID: "550e8400-e29b-41d4-a716-446655440001",
				TaskVersionID:  "550e8400-e29b-41d4-a716-446655440002",
				Name:           "Test SubTask",
				OrderIndex:     10,
			},
			wantErr: false,
		},
		{
			name: "error when id_natural is empty",
			subTask: SubTask{
				IDNatural:      "",
				OrganizationID: "550e8400-e29b-41d4-a716-446655440001",
				TaskVersionID:  "550e8400-e29b-41d4-a716-446655440002",
				Name:           "Test SubTask",
				OrderIndex:     0,
			},
			wantErr: true,
		},
		{
			name: "error when organization_id is empty",
			subTask: SubTask{
				IDNatural:      "550e8400-e29b-41d4-a716-446655440000",
				OrganizationID: "",
				TaskVersionID:  "550e8400-e29b-41d4-a716-446655440002",
				Name:           "Test SubTask",
				OrderIndex:     0,
			},
			wantErr: true,
		},
		{
			name: "error when task_version_id is empty",
			subTask: SubTask{
				IDNatural:      "550e8400-e29b-41d4-a716-446655440000",
				OrganizationID: "550e8400-e29b-41d4-a716-446655440001",
				TaskVersionID:  "",
				Name:           "Test SubTask",
				OrderIndex:     0,
			},
			wantErr: true,
		},
		{
			name: "error when name is empty",
			subTask: SubTask{
				IDNatural:      "550e8400-e29b-41d4-a716-446655440000",
				OrganizationID: "550e8400-e29b-41d4-a716-446655440001",
				TaskVersionID:  "550e8400-e29b-41d4-a716-446655440002",
				Name:           "",
				OrderIndex:     0,
			},
			wantErr: true,
		},
		{
			name: "error when name exceeds 100 characters",
			subTask: SubTask{
				IDNatural:      "550e8400-e29b-41d4-a716-446655440000",
				OrganizationID: "550e8400-e29b-41d4-a716-446655440001",
				TaskVersionID:  "550e8400-e29b-41d4-a716-446655440002",
				Name:           strings.Repeat("a", 101),
				OrderIndex:     0,
			},
			wantErr: true,
		},
		{
			name: "error when order_index is negative",
			subTask: SubTask{
				IDNatural:      "550e8400-e29b-41d4-a716-446655440000",
				OrganizationID: "550e8400-e29b-41d4-a716-446655440001",
				TaskVersionID:  "550e8400-e29b-41d4-a716-446655440002",
				Name:           "Test SubTask",
				OrderIndex:     -1,
			},
			wantErr: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := tt.subTask.validate()

			if tt.wantErr {
				if err == nil {
					t.Errorf("SubTask.validate() error = nil, wantErr %v", tt.wantErr)
				}
			} else {
				if err != nil {
					t.Errorf("SubTask.validate() error = %v, wantErr %v", err, tt.wantErr)
				}
			}
		})
	}
}

func newValidSubTask() SubTask {
	return SubTask{
		IDNatural:      "550e8400-e29b-41d4-a716-446655440000",
		OrganizationID: "550e8400-e29b-41d4-a716-446655440001",
		TaskVersionID:  "550e8400-e29b-41d4-a716-446655440002",
		Name:           "Test SubTask",
		OrderIndex:     0,
	}
}

func TestSubTask_SetName(t *testing.T) {
	tests := []struct {
		name        string
		subTaskName string
		wantErr     bool
	}{
		{
			name:        "success with valid name",
			subTaskName: "New SubTask",
			wantErr:     false,
		},
		{
			name:        "success with name at max length",
			subTaskName: strings.Repeat("b", 100),
			wantErr:     false,
		},
		{
			name:        "error when name is empty",
			subTaskName: "",
			wantErr:     true,
		},
		{
			name:        "error when name exceeds 100 characters",
			subTaskName: strings.Repeat("c", 101),
			wantErr:     true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			s := newValidSubTask()
			err := s.SetName(tt.subTaskName)

			if tt.wantErr {
				if err == nil {
					t.Errorf("SubTask.SetName() error = nil, wantErr %v", tt.wantErr)
				}
			} else {
				if err != nil {
					t.Errorf("SubTask.SetName() error = %v, wantErr %v", err, tt.wantErr)
				}
				if s.Name != tt.subTaskName {
					t.Errorf("SubTask.Name = %v, want %v", s.Name, tt.subTaskName)
				}
			}
		})
	}
}

func TestSubTask_SetDescription(t *testing.T) {
	tests := []struct {
		name        string
		description string
		wantErr     bool
	}{
		{
			name:        "success with valid description",
			description: "New description",
			wantErr:     false,
		},
		{
			name:        "success with empty description",
			description: "",
			wantErr:     false,
		},
		{
			name:        "success with long description",
			description: strings.Repeat("d", 500),
			wantErr:     false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			s := newValidSubTask()
			err := s.SetDescription(tt.description)

			if tt.wantErr {
				if err == nil {
					t.Errorf("SubTask.SetDescription() error = nil, wantErr %v", tt.wantErr)
				}
			} else {
				if err != nil {
					t.Errorf("SubTask.SetDescription() error = %v, wantErr %v", err, tt.wantErr)
				}
				if s.Description == nil {
					t.Errorf("SubTask.Description is nil")
				} else if *s.Description != tt.description {
					t.Errorf("SubTask.Description = %v, want %v", *s.Description, tt.description)
				}
			}
		})
	}
}

func TestSubTask_SetOrderIndex(t *testing.T) {
	tests := []struct {
		name       string
		orderIndex int
		wantErr    bool
	}{
		{
			name:       "success with valid order index",
			orderIndex: 5,
			wantErr:    false,
		},
		{
			name:       "success with order index at 0",
			orderIndex: 0,
			wantErr:    false,
		},
		{
			name:       "error when order index is negative",
			orderIndex: -1,
			wantErr:    true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			s := newValidSubTask()
			err := s.SetOrderIndex(tt.orderIndex)

			if tt.wantErr {
				if err == nil {
					t.Errorf("SubTask.SetOrderIndex() error = nil, wantErr %v", tt.wantErr)
				}
			} else {
				if err != nil {
					t.Errorf("SubTask.SetOrderIndex() error = %v, wantErr %v", err, tt.wantErr)
				}
				if s.OrderIndex != tt.orderIndex {
					t.Errorf("SubTask.OrderIndex = %v, want %v", s.OrderIndex, tt.orderIndex)
				}
			}
		})
	}
}
