package slug

import (
	"regexp"
	"strings"
)

// Generate creates a URL-friendly slug from the given title.
func Generate(title string) string {
	s := strings.ToLower(title)
	re := regexp.MustCompile(`[^a-z0-9]+`)
	s = re.ReplaceAllString(s, "-")
	s = strings.Trim(s, "-")
	if s == "" {
		return "untitled"
	}
	return s
}
