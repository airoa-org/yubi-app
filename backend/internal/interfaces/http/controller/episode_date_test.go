package controller

import (
	"testing"
	"time"

	openapi_types "github.com/oapi-codegen/runtime/types"
)

func mkDate(year int, month time.Month, day int) *openapi_types.Date {
	return &openapi_types.Date{Time: time.Date(year, month, day, 0, 0, 0, 0, time.UTC)}
}

func mkTime(year int, month time.Month, day int) *time.Time {
	tv := time.Date(year, month, day, 0, 0, 0, 0, time.UTC)
	return &tv
}

func TestParseDateRangeHalfOpen_Valid(t *testing.T) {
	tests := []struct {
		name     string
		from     *openapi_types.Date
		to       *openapi_types.Date
		wantFrom *time.Time
		wantTo   *time.Time
	}{
		{
			name:     "both omitted",
			from:     nil,
			to:       nil,
			wantFrom: nil,
			wantTo:   nil,
		},
		{
			name:     "mid-month range — to rolls to next day",
			from:     mkDate(2026, time.January, 10),
			to:       mkDate(2026, time.January, 20),
			wantFrom: mkTime(2026, time.January, 10),
			wantTo:   mkTime(2026, time.January, 21),
		},
		{
			name:     "to on month-end rolls to next month",
			from:     mkDate(2026, time.January, 1),
			to:       mkDate(2026, time.January, 31),
			wantFrom: mkTime(2026, time.January, 1),
			wantTo:   mkTime(2026, time.February, 1),
		},
		{
			name:     "to on year-end rolls to next year",
			from:     mkDate(2026, time.January, 1),
			to:       mkDate(2026, time.December, 31),
			wantFrom: mkTime(2026, time.January, 1),
			wantTo:   mkTime(2027, time.January, 1),
		},
		{
			name:     "to on leap day rolls to Mar 1",
			from:     mkDate(2024, time.February, 1),
			to:       mkDate(2024, time.February, 29),
			wantFrom: mkTime(2024, time.February, 1),
			wantTo:   mkTime(2024, time.March, 1),
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			gotFrom, gotTo, err := parseDateRangeHalfOpen(tt.from, tt.to)

			if err != nil {
				t.Fatalf("unexpected error: %v", err)
			}
			if !timePtrEqual(gotFrom, tt.wantFrom) {
				t.Errorf("from: got %v, want %v", fmtTimePtr(gotFrom), fmtTimePtr(tt.wantFrom))
			}
			if !timePtrEqual(gotTo, tt.wantTo) {
				t.Errorf("to: got %v, want %v", fmtTimePtr(gotTo), fmtTimePtr(tt.wantTo))
			}
		})
	}
}

func TestParseDateRangeHalfOpen_OneSidedReturnsError(t *testing.T) {
	tests := []struct {
		name string
		from *openapi_types.Date
		to   *openapi_types.Date
	}{
		{
			name: "from only",
			from: mkDate(2026, time.January, 15),
			to:   nil,
		},
		{
			name: "to only",
			from: nil,
			to:   mkDate(2026, time.January, 15),
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			_, _, err := parseDateRangeHalfOpen(tt.from, tt.to)

			if err == nil {
				t.Errorf("expected error for one-sided date range, got nil")
			}
		})
	}
}

func timePtrEqual(a, b *time.Time) bool {
	if a == nil && b == nil {
		return true
	}
	if a == nil || b == nil {
		return false
	}
	return a.Equal(*b)
}

func fmtTimePtr(t *time.Time) string {
	if t == nil {
		return "<nil>"
	}
	return t.Format(time.RFC3339Nano)
}
