package model

import (
	"strings"
	"testing"
	"time"
)

func TestInitSite(t *testing.T) {
	tests := []struct {
		name           string
		organizationID string
		siteName       string
		wantErr        bool
	}{
		{
			name:           "success with valid inputs",
			organizationID: "550e8400-e29b-41d4-a716-446655440001",
			siteName:       "Tokyo Office",
			wantErr:        false,
		},
		{
			name:           "error when organization_id is empty",
			organizationID: "",
			siteName:       "Tokyo Office",
			wantErr:        true,
		},
		{
			name:           "error when name is empty",
			organizationID: "550e8400-e29b-41d4-a716-446655440001",
			siteName:       "",
			wantErr:        true,
		},
		{
			name:           "error when name exceeds 100 characters",
			organizationID: "550e8400-e29b-41d4-a716-446655440001",
			siteName:       strings.Repeat("a", 101),
			wantErr:        true,
		},
		{
			name:           "success when name is exactly 100 characters",
			organizationID: "550e8400-e29b-41d4-a716-446655440001",
			siteName:       strings.Repeat("a", 100),
			wantErr:        false,
		},
		{
			name:           "error when multiple fields are empty",
			organizationID: "",
			siteName:       "",
			wantErr:        true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got, err := InitSite(tt.organizationID, tt.siteName)

			if tt.wantErr {
				if err == nil {
					t.Errorf("InitSite() error = nil, wantErr %v", tt.wantErr)
				}
				if got.IDNatural != "" {
					t.Errorf("InitSite() IDNatural = %v, want empty", got.IDNatural)
				}
				return
			}

			if err != nil {
				t.Errorf("InitSite() error = %v, wantErr %v", err, tt.wantErr)
				return
			}
			if got.IDNatural == "" {
				t.Errorf("InitSite() IDNatural is empty")
			}
			if got.OrganizationID != tt.organizationID {
				t.Errorf("InitSite() OrganizationID = %v, want %v", got.OrganizationID, tt.organizationID)
			}
			if got.Name != tt.siteName {
				t.Errorf("InitSite() Name = %v, want %v", got.Name, tt.siteName)
			}
			if got.CreatedAt.IsZero() {
				t.Errorf("InitSite() CreatedAt is zero")
			}
		})
	}
}

func TestNewSite(t *testing.T) {
	now := time.Now()
	updatedAt := now

	tests := []struct {
		name           string
		id             int64
		idNatural      string
		organizationID string
		siteName       string
		createdAt      time.Time
		updatedAt      *time.Time
	}{
		{
			name:           "create with all fields",
			id:             1,
			idNatural:      "550e8400-e29b-41d4-a716-446655440000",
			organizationID: "550e8400-e29b-41d4-a716-446655440001",
			siteName:       "Tokyo Office",
			createdAt:      now,
			updatedAt:      &updatedAt,
		},
		{
			name:           "create with nil updatedAt",
			id:             2,
			idNatural:      "550e8400-e29b-41d4-a716-446655440002",
			organizationID: "550e8400-e29b-41d4-a716-446655440003",
			siteName:       "Osaka Office",
			createdAt:      now,
			updatedAt:      nil,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := NewSite(
				tt.id,
				tt.idNatural,
				tt.organizationID,
				tt.siteName,
				tt.createdAt,
				tt.updatedAt,
			)

			if got.ID != tt.id {
				t.Errorf("NewSite() ID = %v, want %v", got.ID, tt.id)
			}
			if got.IDNatural != tt.idNatural {
				t.Errorf("NewSite() IDNatural = %v, want %v", got.IDNatural, tt.idNatural)
			}
			if got.OrganizationID != tt.organizationID {
				t.Errorf("NewSite() OrganizationID = %v, want %v", got.OrganizationID, tt.organizationID)
			}
			if got.Name != tt.siteName {
				t.Errorf("NewSite() Name = %v, want %v", got.Name, tt.siteName)
			}
			if got.CreatedAt != tt.createdAt {
				t.Errorf("NewSite() CreatedAt = %v, want %v", got.CreatedAt, tt.createdAt)
			}
		})
	}
}

func TestSite_validate(t *testing.T) {
	tests := []struct {
		name    string
		site    Site
		wantErr bool
	}{
		{
			name: "valid with all required fields",
			site: Site{
				IDNatural:      "550e8400-e29b-41d4-a716-446655440000",
				OrganizationID: "550e8400-e29b-41d4-a716-446655440001",
				Name:           "Tokyo Office",
			},
			wantErr: false,
		},
		{
			name: "valid with name at max length",
			site: Site{
				IDNatural:      "550e8400-e29b-41d4-a716-446655440000",
				OrganizationID: "550e8400-e29b-41d4-a716-446655440001",
				Name:           strings.Repeat("a", 100),
			},
			wantErr: false,
		},
		{
			name: "error when id_natural is empty",
			site: Site{
				IDNatural:      "",
				OrganizationID: "550e8400-e29b-41d4-a716-446655440001",
				Name:           "Tokyo Office",
			},
			wantErr: true,
		},
		{
			name: "error when organization_id is empty",
			site: Site{
				IDNatural:      "550e8400-e29b-41d4-a716-446655440000",
				OrganizationID: "",
				Name:           "Tokyo Office",
			},
			wantErr: true,
		},
		{
			name: "error when name is empty",
			site: Site{
				IDNatural:      "550e8400-e29b-41d4-a716-446655440000",
				OrganizationID: "550e8400-e29b-41d4-a716-446655440001",
				Name:           "",
			},
			wantErr: true,
		},
		{
			name: "error when name exceeds 100 characters",
			site: Site{
				IDNatural:      "550e8400-e29b-41d4-a716-446655440000",
				OrganizationID: "550e8400-e29b-41d4-a716-446655440001",
				Name:           strings.Repeat("a", 101),
			},
			wantErr: true,
		},
		{
			name: "error when multiple fields are invalid",
			site: Site{
				IDNatural:      "",
				OrganizationID: "",
				Name:           "",
			},
			wantErr: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := tt.site.validate()

			if tt.wantErr {
				if err == nil {
					t.Errorf("Site.validate() error = nil, wantErr %v", tt.wantErr)
				}
			} else {
				if err != nil {
					t.Errorf("Site.validate() error = %v, wantErr %v", err, tt.wantErr)
				}
			}
		})
	}
}

func TestSite_SetName(t *testing.T) {
	tests := []struct {
		name     string
		siteName string
		wantErr  bool
	}{
		{
			name:     "success with valid name",
			siteName: "New Office",
			wantErr:  false,
		},
		{
			name:     "success with name at max length",
			siteName: strings.Repeat("b", 100),
			wantErr:  false,
		},
		{
			name:     "error when name is empty",
			siteName: "",
			wantErr:  true,
		},
		{
			name:     "error when name exceeds 100 characters",
			siteName: strings.Repeat("c", 101),
			wantErr:  true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			s := newValidSite()
			err := s.SetName(tt.siteName)

			if tt.wantErr {
				if err == nil {
					t.Errorf("Site.SetName() error = nil, wantErr %v", tt.wantErr)
				}
			} else {
				if err != nil {
					t.Errorf("Site.SetName() error = %v, wantErr %v", err, tt.wantErr)
				}
				if s.Name != tt.siteName {
					t.Errorf("Site.Name = %v, want %v", s.Name, tt.siteName)
				}
			}
		})
	}
}

func newValidSite() Site {
	return Site{
		IDNatural:      "550e8400-e29b-41d4-a716-446655440000",
		OrganizationID: "550e8400-e29b-41d4-a716-446655440001",
		Name:           "Tokyo Office",
	}
}
