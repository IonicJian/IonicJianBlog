package slug

import (
	"crypto/sha256"
	"fmt"
	"regexp"
	"strings"
)

// Generate creates a URL-friendly slug from the given title.
// For non-ASCII titles (e.g. Chinese), falls back to a short hash.
func Generate(title string) string {
	s := strings.ToLower(title)
	re := regexp.MustCompile(`[^a-z0-9]+`)
	s = re.ReplaceAllString(s, "-")
	s = strings.Trim(s, "-")
	if s == "" || s == "untitled" {
		// Fallback: use first 8 chars of SHA256 for non-ASCII titles
		h := sha256.Sum256([]byte(title))
		return fmt.Sprintf("post-%x", h[:4])
	}
	return s
}
