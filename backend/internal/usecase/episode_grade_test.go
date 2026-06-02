package usecase

import (
	"context"
	"errors"
	"math"
	"testing"

	"github.com/airoa-org/yubi-app/backend/internal/domain/model"
	"github.com/airoa-org/yubi-app/backend/internal/repository"
)

func newEpisodeGradeUsecaseWithStub(repo repository.EpisodeGrade) *episodeGrade {
	return &episodeGrade{repo: repo}
}

const (
	stubOrgID     = "org-1"
	stubEpisodeID = "ep-1"
	stubUserID    = "user-1"
)

func TestEpisodeGradeUsecase_Upsert_ForwardsValidatedDomainModelToRepo(t *testing.T) {
	comment := "good run"
	stub := &stubEpisodeGradeRepo{
		upsertResult: model.EpisodeGrade{
			EpisodeID: stubEpisodeID, UserID: stubUserID, Grade: 0.85,
		},
	}
	uc := newEpisodeGradeUsecaseWithStub(stub)

	got, err := uc.Upsert(context.Background(), EpisodeGradeUpsertInput{
		EpisodeID:      stubEpisodeID,
		UserID:         stubUserID,
		OrganizationID: stubOrgID,
		Grade:          0.85,
		Comment:        &comment,
	})
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if stub.lastUpsertArg == nil {
		t.Fatalf("expected Upsert to be called on the repo, but lastUpsertArg is nil")
	}
	arg := *stub.lastUpsertArg
	if arg.EpisodeID != stubEpisodeID {
		t.Errorf("repo arg EpisodeID = %v, want %v", arg.EpisodeID, stubEpisodeID)
	}
	if arg.UserID != stubUserID {
		t.Errorf("repo arg UserID = %v, want %v", arg.UserID, stubUserID)
	}
	if arg.OrganizationID != stubOrgID {
		t.Errorf("repo arg OrganizationID = %v, want %v", arg.OrganizationID, stubOrgID)
	}
	if arg.Grade != 0.85 {
		t.Errorf("repo arg Grade = %v, want 0.85", arg.Grade)
	}
	if arg.Comment == nil || *arg.Comment != "good run" {
		t.Errorf("repo arg Comment = %v, want pointer to %q", arg.Comment, "good run")
	}

	if got.Grade != 0.85 {
		t.Errorf("returned Grade = %v, want 0.85", got.Grade)
	}
}

func TestEpisodeGradeUsecase_Upsert_AcceptsBoundaryGrades(t *testing.T) {
	tests := []struct {
		name  string
		grade float64
	}{
		{name: "lower bound 0.0", grade: 0.0},
		{name: "just above lower bound", grade: 0.01},
		{name: "upper bound 1.0", grade: 1.0},
		{name: "just below upper bound", grade: 0.99},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			stub := &stubEpisodeGradeRepo{
				upsertResult: model.EpisodeGrade{Grade: tt.grade},
			}
			uc := newEpisodeGradeUsecaseWithStub(stub)

			_, err := uc.Upsert(context.Background(), EpisodeGradeUpsertInput{
				EpisodeID:      stubEpisodeID,
				UserID:         stubUserID,
				OrganizationID: stubOrgID,
				Grade:          tt.grade,
			})
			if err != nil {
				t.Errorf("expected grade %v to be accepted, got error %v", tt.grade, err)
			}
		})
	}
}

func TestEpisodeGradeUsecase_Upsert_RejectsOutOfRangeGrade(t *testing.T) {
	tests := []struct {
		name  string
		grade float64
	}{
		{name: "just below lower bound", grade: -0.01},
		{name: "well below lower bound", grade: -1.0},
		{name: "just above upper bound", grade: 1.01},
		{name: "well above upper bound", grade: 1.5},
		{name: "NaN", grade: math.NaN()},
		{name: "positive infinity", grade: math.Inf(1)},
		{name: "negative infinity", grade: math.Inf(-1)},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			stub := &stubEpisodeGradeRepo{}
			uc := newEpisodeGradeUsecaseWithStub(stub)

			_, err := uc.Upsert(context.Background(), EpisodeGradeUpsertInput{
				EpisodeID:      stubEpisodeID,
				UserID:         stubUserID,
				OrganizationID: stubOrgID,
				Grade:          tt.grade,
			})
			if err == nil {
				t.Errorf("expected validation error for grade %v, got nil", tt.grade)
			}
			if stub.lastUpsertArg != nil {
				t.Errorf("invalid grade %v should never reach the repo, but Upsert was called", tt.grade)
			}
		})
	}
}

func TestEpisodeGradeUsecase_Upsert_PropagatesRepoError(t *testing.T) {
	wantErr := errors.New("db unavailable")
	stub := &stubEpisodeGradeRepo{upsertErr: wantErr}
	uc := newEpisodeGradeUsecaseWithStub(stub)

	_, err := uc.Upsert(context.Background(), EpisodeGradeUpsertInput{
		EpisodeID:      stubEpisodeID,
		UserID:         stubUserID,
		OrganizationID: stubOrgID,
		Grade:          0.5,
	})
	if !errors.Is(err, wantErr) {
		t.Errorf("error = %v, want %v", err, wantErr)
	}
}

func TestEpisodeGradeUsecase_GetMyGrade_ReturnsNilWhenNotGraded(t *testing.T) {
	stub := &stubEpisodeGradeRepo{myGrade: nil}
	uc := newEpisodeGradeUsecaseWithStub(stub)

	got, err := uc.GetMyGrade(context.Background(), stubEpisodeID, stubUserID)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if got != nil {
		t.Errorf("expected nil grade, got %v", got)
	}
}

func TestEpisodeGradeUsecase_GetMyGrade_ReturnsGradeWhenPresent(t *testing.T) {
	want := &model.EpisodeGrade{
		EpisodeID: stubEpisodeID,
		UserID:    stubUserID,
		Grade:     0.7,
	}
	stub := &stubEpisodeGradeRepo{myGrade: want}
	uc := newEpisodeGradeUsecaseWithStub(stub)

	got, err := uc.GetMyGrade(context.Background(), stubEpisodeID, stubUserID)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if got == nil || got.Grade != 0.7 {
		t.Errorf("got %+v, want grade=0.7", got)
	}
}

func TestEpisodeGradeUsecase_GetMyGrade_PropagatesRepoError(t *testing.T) {
	wantErr := errors.New("db unavailable")
	stub := &stubEpisodeGradeRepo{myGradeErr: wantErr}
	uc := newEpisodeGradeUsecaseWithStub(stub)

	_, err := uc.GetMyGrade(context.Background(), stubEpisodeID, stubUserID)
	if !errors.Is(err, wantErr) {
		t.Errorf("error = %v, want %v", err, wantErr)
	}
}

func TestEpisodeGradeUsecase_List_ForwardsPaginationAsOffsetLimit(t *testing.T) {
	tests := []struct {
		name       string
		page       int
		limit      int
		wantLimit  int
		wantOffset int
	}{
		{name: "page 1, limit 20", page: 1, limit: 20, wantLimit: 20, wantOffset: 0},
		{name: "page 3, limit 10", page: 3, limit: 10, wantLimit: 10, wantOffset: 20},
		{name: "zero page falls back to 1", page: 0, limit: 50, wantLimit: 50, wantOffset: 0},
		{name: "negative page falls back to 1", page: -5, limit: 50, wantLimit: 50, wantOffset: 0},
		{name: "zero limit falls back to default", page: 2, limit: 0, wantLimit: 20, wantOffset: 20},
		{name: "negative limit falls back to default", page: 2, limit: -1, wantLimit: 20, wantOffset: 20},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			stub := &stubEpisodeGradeRepo{}
			uc := newEpisodeGradeUsecaseWithStub(stub)

			if _, _, err := uc.List(context.Background(), stubEpisodeID, tt.page, tt.limit); err != nil {
				t.Fatalf("unexpected error: %v", err)
			}

			if stub.lastListEpisode != stubEpisodeID {
				t.Errorf("repo episodeID = %q, want %q", stub.lastListEpisode, stubEpisodeID)
			}
			if stub.lastListLimit != tt.wantLimit {
				t.Errorf("repo limit = %d, want %d", stub.lastListLimit, tt.wantLimit)
			}
			if stub.lastListOffset != tt.wantOffset {
				t.Errorf("repo offset = %d, want %d", stub.lastListOffset, tt.wantOffset)
			}
		})
	}
}

func TestEpisodeGradeUsecase_List_ReturnsItemsAndTotalFromRepo(t *testing.T) {
	want := []repository.EpisodeGradeListItem{
		{Grade: model.EpisodeGrade{EpisodeID: stubEpisodeID, UserID: "u1", Grade: 0.9}, UserName: "Alice"},
		{Grade: model.EpisodeGrade{EpisodeID: stubEpisodeID, UserID: "u2", Grade: 0.5}, UserName: "Bob"},
	}
	stub := &stubEpisodeGradeRepo{listItems: want, listTotal: 17}
	uc := newEpisodeGradeUsecaseWithStub(stub)

	got, total, err := uc.List(context.Background(), stubEpisodeID, 1, 10)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if total != 17 {
		t.Errorf("total = %d, want 17", total)
	}
	if len(got) != 2 {
		t.Fatalf("len(items) = %d, want 2", len(got))
	}
	if got[0].UserName != "Alice" || got[1].UserName != "Bob" {
		t.Errorf("user_name order = %q,%q, want Alice,Bob", got[0].UserName, got[1].UserName)
	}
}

func TestEpisodeGradeUsecase_List_PropagatesRepoError(t *testing.T) {
	wantErr := errors.New("db unavailable")
	stub := &stubEpisodeGradeRepo{listErr: wantErr}
	uc := newEpisodeGradeUsecaseWithStub(stub)

	_, _, err := uc.List(context.Background(), stubEpisodeID, 1, 10)
	if !errors.Is(err, wantErr) {
		t.Errorf("error = %v, want %v", err, wantErr)
	}
}
