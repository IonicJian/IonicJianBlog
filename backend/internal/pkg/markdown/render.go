package markdown

import (
	"strings"

	"github.com/yuin/goldmark"
)

var md = goldmark.New()

func ToHTML(content string) string {
	var buf strings.Builder
	if err := md.Convert([]byte(content), &buf); err != nil {
		return content // fallback to raw content
	}
	return buf.String()
}
