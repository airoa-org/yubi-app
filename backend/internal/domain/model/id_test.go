package model

import (
	"regexp"
	"testing"
)

func TestInitID(t *testing.T) {
	uuidPattern := regexp.MustCompile(`^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$`)

	tests := []struct {
		name    string
		wantErr bool
	}{
		{
			name:    "success generates valid UUID v4",
			wantErr: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got, err := InitID()

			if tt.wantErr {
				if err == nil {
					t.Errorf("InitID() error = nil, wantErr %v", tt.wantErr)
				}
				return
			}

			if err != nil {
				t.Errorf("InitID() error = %v, wantErr %v", err, tt.wantErr)
				return
			}
			if got == "" {
				t.Errorf("InitID() returned empty string")
			}
			if !uuidPattern.MatchString(got) {
				t.Errorf("InitID() = %v, does not match UUID v4 pattern", got)
			}
		})
	}
}
