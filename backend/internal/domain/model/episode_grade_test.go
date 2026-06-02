package model

import (
	"math"
	"testing"
	"time"
)

const (
	testOrgID     = "550e8400-e29b-41d4-a716-446655440001"
	testEpisodeID = "550e8400-e29b-41d4-a716-446655440002"
	testUserID    = "550e8400-e29b-41d4-a716-446655440003"
)

// assertNowish verifies that t falls within [before, after] inclusive.
// Use to check that a timestamp was set to "now" without depending on sleep.
func assertNowish(t *testing.T, label string, got, before, after time.Time) {
	t.Helper()
	if got.Before(before) || got.After(after) {
		t.Errorf("%s = %v, want within [%v, %v]", label, got, before, after)
	}
}

func TestInitEpisodeGrade_AcceptsValidGrade(t *testing.T) {
	comment := "good run"
	tests := []struct {
		name    string
		grade   float64
		comment *string
	}{
		{name: "grade is 0 (lower bound)", grade: 0.0, comment: nil},
		{name: "grade is 1 (upper bound)", grade: 1.0, comment: &comment},
		{name: "grade is middle value", grade: 0.5, comment: nil},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			before := time.Now()
			got, err := InitEpisodeGrade(testOrgID, testEpisodeID, testUserID, tt.grade, tt.comment)
			after := time.Now()
			if err != nil {
				t.Fatalf("unexpected error: %v", err)
			}
			if got.Grade != tt.grade {
				t.Errorf("Grade = %v, want %v", got.Grade, tt.grade)
			}
			if got.EpisodeID != testEpisodeID {
				t.Errorf("EpisodeID = %v, want %v", got.EpisodeID, testEpisodeID)
			}
			if got.UserID != testUserID {
				t.Errorf("UserID = %v, want %v", got.UserID, testUserID)
			}
			assertNowish(t, "GradedAt", got.GradedAt, before, after)
			assertNowish(t, "CreatedAt", got.CreatedAt, before, after)
		})
	}
}

func TestInitEpisodeGrade_RejectsInvalidInput(t *testing.T) {
	tests := []struct {
		name           string
		organizationID string
		episodeID      string
		userID         string
		grade          float64
	}{
		{name: "grade is below 0", organizationID: testOrgID, episodeID: testEpisodeID, userID: testUserID, grade: -0.01},
		{name: "grade is above 1", organizationID: testOrgID, episodeID: testEpisodeID, userID: testUserID, grade: 1.01},
		{name: "grade is NaN", organizationID: testOrgID, episodeID: testEpisodeID, userID: testUserID, grade: math.NaN()},
		{name: "grade is positive infinity", organizationID: testOrgID, episodeID: testEpisodeID, userID: testUserID, grade: math.Inf(1)},
		{name: "grade is negative infinity", organizationID: testOrgID, episodeID: testEpisodeID, userID: testUserID, grade: math.Inf(-1)},
		{name: "organization_id is empty", organizationID: "", episodeID: testEpisodeID, userID: testUserID, grade: 0.5},
		{name: "episode_id is empty", organizationID: testOrgID, episodeID: "", userID: testUserID, grade: 0.5},
		{name: "user_id is empty", organizationID: testOrgID, episodeID: testEpisodeID, userID: "", grade: 0.5},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			_, err := InitEpisodeGrade(tt.organizationID, tt.episodeID, tt.userID, tt.grade, nil)
			if err == nil {
				t.Errorf("expected error, got nil")
			}
		})
	}
}

func TestEpisodeGrade_UpdateGrade_ChangesGradeAndRefreshesGradedAt(t *testing.T) {
	eg, err := InitEpisodeGrade(testOrgID, testEpisodeID, testUserID, 0.5, nil)
	if err != nil {
		t.Fatalf("setup failed: %v", err)
	}

	before := time.Now()
	if err := eg.UpdateGrade(0.9); err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	after := time.Now()

	if eg.Grade != 0.9 {
		t.Errorf("Grade = %v, want 0.9", eg.Grade)
	}
	assertNowish(t, "GradedAt", eg.GradedAt, before, after)
}

func TestEpisodeGrade_UpdateGrade_RejectsOutOfRange(t *testing.T) {
	tests := []struct {
		name  string
		grade float64
	}{
		{name: "grade above 1", grade: 1.5},
		{name: "grade below 0", grade: -0.1},
		{name: "grade is NaN", grade: math.NaN()},
		{name: "grade is +Inf", grade: math.Inf(1)},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			eg, err := InitEpisodeGrade(testOrgID, testEpisodeID, testUserID, 0.5, nil)
			if err != nil {
				t.Fatalf("setup failed: %v", err)
			}
			if err := eg.UpdateGrade(tt.grade); err == nil {
				t.Errorf("expected error, got nil")
			}
		})
	}
}

func TestEpisodeGrade_RejectsCommentLongerThanMax(t *testing.T) {
	tooLong := make([]byte, MaxCommentLength+1)
	for i := range tooLong {
		tooLong[i] = 'a'
	}
	s := string(tooLong)
	if _, err := InitEpisodeGrade(testOrgID, testEpisodeID, testUserID, 0.5, &s); err == nil {
		t.Errorf("expected error for comment longer than %d chars, got nil", MaxCommentLength)
	}
}

func TestEpisodeGrade_AcceptsCommentJustBelowMax(t *testing.T) {
	belowMax := make([]byte, MaxCommentLength-1)
	for i := range belowMax {
		belowMax[i] = 'a'
	}
	s := string(belowMax)
	if _, err := InitEpisodeGrade(testOrgID, testEpisodeID, testUserID, 0.5, &s); err != nil {
		t.Errorf("expected comment of %d chars (max-1) to be accepted, got %v", len(s), err)
	}
}

func TestEpisodeGrade_AcceptsCommentExactlyAtMax(t *testing.T) {
	exact := make([]byte, MaxCommentLength)
	for i := range exact {
		exact[i] = 'a'
	}
	max := string(exact)
	if _, err := InitEpisodeGrade(testOrgID, testEpisodeID, testUserID, 0.5, &max); err != nil {
		t.Errorf("expected comment of exactly %d chars to be accepted, got %v", MaxCommentLength, err)
	}
}

func TestEpisodeGrade_UpdateComment_SetsCommentAndRefreshesGradedAt(t *testing.T) {
	eg, err := InitEpisodeGrade(testOrgID, testEpisodeID, testUserID, 0.5, nil)
	if err != nil {
		t.Fatalf("setup failed: %v", err)
	}

	c := "looks good"
	before := time.Now()
	if err := eg.UpdateComment(&c); err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	after := time.Now()

	if eg.Comment == nil || *eg.Comment != "looks good" {
		t.Errorf("Comment = %v, want %q", eg.Comment, "looks good")
	}
	assertNowish(t, "GradedAt", eg.GradedAt, before, after)
}

func TestEpisodeGrade_UpdateComment_AllowsNil(t *testing.T) {
	original := "initial comment"
	eg, err := InitEpisodeGrade(testOrgID, testEpisodeID, testUserID, 0.5, &original)
	if err != nil {
		t.Fatalf("setup failed: %v", err)
	}

	if err := eg.UpdateComment(nil); err != nil {
		t.Errorf("UpdateComment(nil) should be allowed, got %v", err)
	}
	if eg.Comment != nil {
		t.Errorf("Comment should be nil after clearing")
	}
}

func TestNewEpisodeGrade_ReconstructsFromDBRow(t *testing.T) {
	createdAt := time.Date(2026, 5, 14, 0, 0, 0, 0, time.UTC)
	gradedAt := createdAt.Add(1 * time.Hour)
	updatedAt := createdAt.Add(2 * time.Hour)
	comment := "rebuild from db row"

	eg := NewEpisodeGrade(testOrgID, testEpisodeID, testUserID, 0.7, &comment, gradedAt, createdAt, &updatedAt)

	if eg.Grade != 0.7 {
		t.Errorf("Grade = %v, want 0.7", eg.Grade)
	}
	if eg.Comment == nil || *eg.Comment != "rebuild from db row" {
		t.Errorf("Comment = %v", eg.Comment)
	}
	if !eg.GradedAt.Equal(gradedAt) {
		t.Errorf("GradedAt = %v, want %v", eg.GradedAt, gradedAt)
	}
	if !eg.CreatedAt.Equal(createdAt) {
		t.Errorf("CreatedAt = %v, want %v", eg.CreatedAt, createdAt)
	}
	if eg.UpdatedAt == nil || !eg.UpdatedAt.Equal(updatedAt) {
		t.Errorf("UpdatedAt = %v, want %v", eg.UpdatedAt, updatedAt)
	}
}
