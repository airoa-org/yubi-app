package model

import (
	"strings"
	"testing"
	"time"
)

func TestGenerateAPIKey_RoundTrip(t *testing.T) {
	raw, hash, hint, err := GenerateAPIKey()
	if err != nil {
		t.Fatalf("GenerateAPIKey: %v", err)
	}
	if len(raw) == 0 {
		t.Fatal("raw is empty")
	}
	if len(hash) != 64 {
		t.Fatalf("hash length = %d, want 64", len(hash))
	}
	if HashAPIKey(raw) != hash {
		t.Fatal("HashAPIKey(raw) != hash returned from GenerateAPIKey")
	}
	if !strings.Contains(hint, "…") {
		t.Fatalf("hint should contain ellipsis, got %q", hint)
	}
}

func TestGenerateAPIKey_Unique(t *testing.T) {
	seen := map[string]struct{}{}
	for i := 0; i < 64; i++ {
		raw, _, _, err := GenerateAPIKey()
		if err != nil {
			t.Fatalf("GenerateAPIKey: %v", err)
		}
		if _, dup := seen[raw]; dup {
			t.Fatalf("duplicate key generated at iteration %d", i)
		}
		seen[raw] = struct{}{}
	}
}

func TestCompareHashes(t *testing.T) {
	a := HashAPIKey("abc")
	b := HashAPIKey("abc")
	c := HashAPIKey("abd")
	if !CompareHashes(a, b) {
		t.Fatal("expected equal hashes to compare true")
	}
	if CompareHashes(a, c) {
		t.Fatal("expected different hashes to compare false")
	}
	if CompareHashes(a, "") {
		t.Fatal("expected different-length compare false")
	}
}

func TestAPIKey_IsActive(t *testing.T) {
	now := time.Date(2026, 5, 12, 12, 0, 0, 0, time.UTC)
	past := now.Add(-time.Hour)
	future := now.Add(time.Hour)

	cases := []struct {
		name string
		k    APIKey
		want bool
	}{
		{"active without expiry", APIKey{}, true},
		{"active with future expiry", APIKey{ExpiresAt: &future}, true},
		{"expired", APIKey{ExpiresAt: &past}, false},
		{"revoked", APIKey{RevokedAt: &past}, false},
		{"revoked overrides future expiry", APIKey{ExpiresAt: &future, RevokedAt: &past}, false},
		{"expires_at equal to now treated as expired", APIKey{ExpiresAt: &now}, false},
	}
	for _, c := range cases {
		t.Run(c.name, func(t *testing.T) {
			if got := c.k.IsActive(now); got != c.want {
				t.Fatalf("IsActive = %v, want %v", got, c.want)
			}
		})
	}
}

func TestInitAPIKey(t *testing.T) {
	robotID := "robot-1"
	expires := time.Now().UTC().Add(time.Hour)
	k, raw, err := InitAPIKey("org-1", "user-1", 0, &robotID, "test", &expires)
	if err != nil {
		t.Fatalf("InitAPIKey: %v", err)
	}
	if k.IDNatural == "" {
		t.Fatal("IDNatural should be set")
	}
	if k.KeyHash != HashAPIKey(raw) {
		t.Fatal("KeyHash mismatch")
	}
	if k.OrganizationID != "org-1" || k.UserID != "user-1" {
		t.Fatal("org/user not propagated")
	}
	if k.RobotID == nil || *k.RobotID != "robot-1" {
		t.Fatal("robot_id not propagated")
	}
	if k.ExpiresAt == nil || !k.ExpiresAt.Equal(expires) {
		t.Fatal("expires_at not propagated")
	}
}

func TestInitAPIKey_ValidationError(t *testing.T) {
	_, _, err := InitAPIKey("", "user-1", 0, nil, "test", nil)
	if err == nil {
		t.Fatal("expected validation error for empty organization_id")
	}
}

func TestAPIKey_Revoke_Idempotent(t *testing.T) {
	first := time.Date(2026, 5, 1, 0, 0, 0, 0, time.UTC)
	later := time.Date(2026, 5, 2, 0, 0, 0, 0, time.UTC)

	k := APIKey{}
	k.Revoke(first)
	if k.RevokedAt == nil || !k.RevokedAt.Equal(first) {
		t.Fatal("first revoke should set RevokedAt")
	}
	k.Revoke(later)
	if !k.RevokedAt.Equal(first) {
		t.Fatal("subsequent revoke should not overwrite RevokedAt")
	}
}
