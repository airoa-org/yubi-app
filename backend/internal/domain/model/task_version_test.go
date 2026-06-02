package model

import (
	"strings"
	"testing"
)

const (
	orgIDForTest   = "550e8400-e29b-41d4-a716-446655440001"
	taskIDForTest  = "550e8400-e29b-41d4-a716-446655440002"
	versionForTest = "v1.0.0"
)

func ptr[T any](v T) *T { return &v }

func TestTaskVersion_DisplayLabel(t *testing.T) {
	tests := []struct {
		name        string
		taskName    string
		version     string
		displayName *string
		want        string
	}{
		{
			name:        "explicit display name takes precedence",
			taskName:    "Pick and Place",
			version:     "v1.0.0",
			displayName: ptr("Left-arm rev2"),
			want:        "Left-arm rev2",
		},
		{
			name:        "nil display name falls back to task name + version",
			taskName:    "Pick and Place",
			version:     "v1.0.0",
			displayName: nil,
			want:        "Pick and Place v1.0.0",
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			tv := TaskVersion{Version: tc.version, DisplayName: tc.displayName}
			if got := tv.DisplayLabel(tc.taskName); got != tc.want {
				t.Errorf("DisplayLabel(%q) = %q, want %q", tc.taskName, got, tc.want)
			}
		})
	}
}

func TestInitTaskVersion_DisplayName(t *testing.T) {
	tests := []struct {
		name        string
		displayName *string
		wantStored  *string
		wantErr     bool
	}{
		{
			name:        "nil display name stays nil",
			displayName: nil,
			wantStored:  nil,
		},
		{
			name:        "empty string is normalized to nil",
			displayName: ptr(""),
			wantStored:  nil,
		},
		{
			name:        "whitespace-only is normalized to nil",
			displayName: ptr("   "),
			wantStored:  nil,
		},
		{
			name:        "whitespace is trimmed",
			displayName: ptr("  Left-arm rev2  "),
			wantStored:  ptr("Left-arm rev2"),
		},
		{
			name:        "100-char string is accepted",
			displayName: ptr(strings.Repeat("a", 100)),
			wantStored:  ptr(strings.Repeat("a", 100)),
		},
		{
			name:        "over 100 chars is rejected",
			displayName: ptr(strings.Repeat("a", 101)),
			wantErr:     true,
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			tv, err := InitTaskVersion(orgIDForTest, taskIDForTest, versionForTest, tc.displayName, nil, nil, nil, nil)
			if tc.wantErr {
				if err == nil {
					t.Fatalf("expected validation error, got nil")
				}
				return
			}
			if err != nil {
				t.Fatalf("unexpected error: %v", err)
			}
			switch {
			case tc.wantStored == nil && tv.DisplayName != nil:
				t.Errorf("DisplayName = %q, want nil", *tv.DisplayName)
			case tc.wantStored != nil && tv.DisplayName == nil:
				t.Errorf("DisplayName = nil, want %q", *tc.wantStored)
			case tc.wantStored != nil && tv.DisplayName != nil && *tv.DisplayName != *tc.wantStored:
				t.Errorf("DisplayName = %q, want %q", *tv.DisplayName, *tc.wantStored)
			}
		})
	}
}
