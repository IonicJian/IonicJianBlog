// Package oauthstore provides an in-memory, TTL-based store for
// OAuth single-use exchange codes. Codes are generated after a
// successful GitHub OAuth callback and exchanged for tokens via a
// dedicated API endpoint — this keeps tokens out of browser history,
// server logs, and Referer headers.
package oauthstore

import (
	"crypto/rand"
	"encoding/hex"
	"sync"
	"time"
)

// Entry holds the tokens and user info for a pending exchange.
type Entry struct {
	AccessToken  string
	RefreshToken string
	ExpiresIn    int64
	UserID       int64
	Role         string
}

type store struct {
	mu    sync.RWMutex
	codes map[string]Entry
}

var s = &store{codes: make(map[string]Entry)}

// Put stores the entry and returns a single-use exchange code valid for 5 minutes.
func Put(e Entry) (string, error) {
	code, err := generateCode()
	if err != nil {
		return "", err
	}
	s.mu.Lock()
	s.codes[code] = e
	s.mu.Unlock()

	// Purge after 5 minutes
	time.AfterFunc(5*time.Minute, func() {
		s.mu.Lock()
		delete(s.codes, code)
		s.mu.Unlock()
	})
	return code, nil
}

// Take retrieves and deletes the entry (single-use).
func Take(code string) (Entry, bool) {
	s.mu.Lock()
	defer s.mu.Unlock()
	e, ok := s.codes[code]
	if ok {
		delete(s.codes, code)
	}
	return e, ok
}

func generateCode() (string, error) {
	b := make([]byte, 32)
	if _, err := rand.Read(b); err != nil {
		return "", err
	}
	return hex.EncodeToString(b), nil
}
