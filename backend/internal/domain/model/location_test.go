package model

import (
	"strings"
	"testing"
	"time"
)

func TestInitLocation(t *testing.T) {
	tests := []struct {
		name           string
		organizationID string
		siteID         string
		locationName   string
		wantErr        bool
	}{
		{
			name:           "success with valid inputs",
			organizationID: "550e8400-e29b-41d4-a716-446655440001",
			siteID:         "550e8400-e29b-41d4-a716-446655440010",
			locationName:   "Tokyo Office",
			wantErr:        false,
		},
		{
			name:           "error when organization_id is empty",
			organizationID: "",
			siteID:         "550e8400-e29b-41d4-a716-446655440010",
			locationName:   "Tokyo Office",
			wantErr:        true,
		},
		{
			name:           "error when site_id is empty",
			organizationID: "550e8400-e29b-41d4-a716-446655440001",
			siteID:         "",
			locationName:   "Tokyo Office",
			wantErr:        true,
		},
		{
			name:           "error when name is empty",
			organizationID: "550e8400-e29b-41d4-a716-446655440001",
			siteID:         "550e8400-e29b-41d4-a716-446655440010",
			locationName:   "",
			wantErr:        true,
		},
		{
			name:           "error when name exceeds 100 characters",
			organizationID: "550e8400-e29b-41d4-a716-446655440001",
			siteID:         "550e8400-e29b-41d4-a716-446655440010",
			locationName:   strings.Repeat("a", 101),
			wantErr:        true,
		},
		{
			name:           "success when name is exactly 100 characters",
			organizationID: "550e8400-e29b-41d4-a716-446655440001",
			siteID:         "550e8400-e29b-41d4-a716-446655440010",
			locationName:   strings.Repeat("a", 100),
			wantErr:        false,
		},
		{
			name:           "error when multiple fields are empty",
			organizationID: "",
			siteID:         "",
			locationName:   "",
			wantErr:        true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got, err := InitLocation(tt.organizationID, tt.siteID, tt.locationName)

			if tt.wantErr {
				if err == nil {
					t.Errorf("InitLocation() error = nil, wantErr %v", tt.wantErr)
				}
				if got.IDNatural != "" {
					t.Errorf("InitLocation() IDNatural = %v, want empty", got.IDNatural)
				}
				return
			}

			if err != nil {
				t.Errorf("InitLocation() error = %v, wantErr %v", err, tt.wantErr)
				return
			}
			if got.IDNatural == "" {
				t.Errorf("InitLocation() IDNatural is empty")
			}
			if got.OrganizationID != tt.organizationID {
				t.Errorf("InitLocation() OrganizationID = %v, want %v", got.OrganizationID, tt.organizationID)
			}
			if got.Name != tt.locationName {
				t.Errorf("InitLocation() Name = %v, want %v", got.Name, tt.locationName)
			}
			if got.CreatedAt.IsZero() {
				t.Errorf("InitLocation() CreatedAt is zero")
			}
		})
	}
}

func TestNewLocation(t *testing.T) {
	now := time.Now()
	updatedAt := now

	tests := []struct {
		name           string
		id             int64
		idNatural      string
		organizationID string
		siteID         string
		locationName   string
		createdAt      time.Time
		updatedAt      *time.Time
	}{
		{
			name:           "create with all fields",
			id:             1,
			idNatural:      "550e8400-e29b-41d4-a716-446655440000",
			organizationID: "550e8400-e29b-41d4-a716-446655440001",
			siteID:         "550e8400-e29b-41d4-a716-446655440010",
			locationName:   "Tokyo Office",
			createdAt:      now,
			updatedAt:      &updatedAt,
		},
		{
			name:           "create with nil updatedAt",
			id:             2,
			idNatural:      "550e8400-e29b-41d4-a716-446655440002",
			organizationID: "550e8400-e29b-41d4-a716-446655440003",
			siteID:         "550e8400-e29b-41d4-a716-446655440011",
			locationName:   "Osaka Office",
			createdAt:      now,
			updatedAt:      nil,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := NewLocation(
				tt.id,
				tt.idNatural,
				tt.organizationID,
				tt.siteID,
				tt.locationName,
				tt.createdAt,
				tt.updatedAt,
			)

			if got.ID != tt.id {
				t.Errorf("NewLocation() ID = %v, want %v", got.ID, tt.id)
			}
			if got.IDNatural != tt.idNatural {
				t.Errorf("NewLocation() IDNatural = %v, want %v", got.IDNatural, tt.idNatural)
			}
			if got.OrganizationID != tt.organizationID {
				t.Errorf("NewLocation() OrganizationID = %v, want %v", got.OrganizationID, tt.organizationID)
			}
			if got.Name != tt.locationName {
				t.Errorf("NewLocation() Name = %v, want %v", got.Name, tt.locationName)
			}
			if got.CreatedAt != tt.createdAt {
				t.Errorf("NewLocation() CreatedAt = %v, want %v", got.CreatedAt, tt.createdAt)
			}
		})
	}
}

func TestLocation_validate(t *testing.T) {
	tests := []struct {
		name     string
		location Location
		wantErr  bool
	}{
		{
			name: "valid with all required fields",
			location: Location{
				IDNatural:      "550e8400-e29b-41d4-a716-446655440000",
				OrganizationID: "550e8400-e29b-41d4-a716-446655440001",
				SiteID:         "550e8400-e29b-41d4-a716-446655440010",
				Name:           "Tokyo Office",
			},
			wantErr: false,
		},
		{
			name: "valid with name at max length",
			location: Location{
				IDNatural:      "550e8400-e29b-41d4-a716-446655440000",
				OrganizationID: "550e8400-e29b-41d4-a716-446655440001",
				SiteID:         "550e8400-e29b-41d4-a716-446655440010",
				Name:           strings.Repeat("a", 100),
			},
			wantErr: false,
		},
		{
			name: "error when id_natural is empty",
			location: Location{
				IDNatural:      "",
				OrganizationID: "550e8400-e29b-41d4-a716-446655440001",
				SiteID:         "550e8400-e29b-41d4-a716-446655440010",
				Name:           "Tokyo Office",
			},
			wantErr: true,
		},
		{
			name: "error when organization_id is empty",
			location: Location{
				IDNatural:      "550e8400-e29b-41d4-a716-446655440000",
				OrganizationID: "",
				SiteID:         "550e8400-e29b-41d4-a716-446655440010",
				Name:           "Tokyo Office",
			},
			wantErr: true,
		},
		{
			name: "error when site_id is empty",
			location: Location{
				IDNatural:      "550e8400-e29b-41d4-a716-446655440000",
				OrganizationID: "550e8400-e29b-41d4-a716-446655440001",
				SiteID:         "",
				Name:           "Tokyo Office",
			},
			wantErr: true,
		},
		{
			name: "error when name is empty",
			location: Location{
				IDNatural:      "550e8400-e29b-41d4-a716-446655440000",
				OrganizationID: "550e8400-e29b-41d4-a716-446655440001",
				SiteID:         "550e8400-e29b-41d4-a716-446655440010",
				Name:           "",
			},
			wantErr: true,
		},
		{
			name: "error when name exceeds 100 characters",
			location: Location{
				IDNatural:      "550e8400-e29b-41d4-a716-446655440000",
				OrganizationID: "550e8400-e29b-41d4-a716-446655440001",
				SiteID:         "550e8400-e29b-41d4-a716-446655440010",
				Name:           strings.Repeat("a", 101),
			},
			wantErr: true,
		},
		{
			name: "error when multiple fields are invalid",
			location: Location{
				IDNatural:      "",
				OrganizationID: "",
				Name:           "",
			},
			wantErr: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := tt.location.validate()

			if tt.wantErr {
				if err == nil {
					t.Errorf("Location.validate() error = nil, wantErr %v", tt.wantErr)
				}
			} else {
				if err != nil {
					t.Errorf("Location.validate() error = %v, wantErr %v", err, tt.wantErr)
				}
			}
		})
	}
}

func newValidLocation() Location {
	return Location{
		IDNatural:      "550e8400-e29b-41d4-a716-446655440000",
		OrganizationID: "550e8400-e29b-41d4-a716-446655440001",
		SiteID:         "550e8400-e29b-41d4-a716-446655440010",
		Name:           "Tokyo Office",
	}
}

func TestLocation_SetName(t *testing.T) {
	tests := []struct {
		name         string
		locationName string
		wantErr      bool
	}{
		{
			name:         "success with valid name",
			locationName: "New Office",
			wantErr:      false,
		},
		{
			name:         "success with name at max length",
			locationName: strings.Repeat("b", 100),
			wantErr:      false,
		},
		{
			name:         "error when name is empty",
			locationName: "",
			wantErr:      true,
		},
		{
			name:         "error when name exceeds 100 characters",
			locationName: strings.Repeat("c", 101),
			wantErr:      true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			l := newValidLocation()
			err := l.SetName(tt.locationName)

			if tt.wantErr {
				if err == nil {
					t.Errorf("Location.SetName() error = nil, wantErr %v", tt.wantErr)
				}
			} else {
				if err != nil {
					t.Errorf("Location.SetName() error = %v, wantErr %v", err, tt.wantErr)
				}
				if l.Name != tt.locationName {
					t.Errorf("Location.Name = %v, want %v", l.Name, tt.locationName)
				}
			}
		})
	}
}
