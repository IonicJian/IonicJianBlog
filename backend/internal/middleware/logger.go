package middleware

import (
	"crypto/rand"
	"encoding/hex"
	"net/url"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/rs/zerolog"
	"github.com/rs/zerolog/log"
)

// sensitiveParams are query parameter names that should be redacted from logs.
var sensitiveParams = map[string]bool{
	"access_token":  true,
	"refresh_token": true,
	"token":         true,
	"key":           true,
	"secret":        true,
	"password":      true,
	"authorization": true,
	"code":          true, // OAuth exchange codes are single-use private values
}

// redactQuery returns the query string with sensitive parameter values replaced by [REDACTED].
func redactQuery(raw string) string {
	if raw == "" {
		return ""
	}
	values, err := url.ParseQuery(raw)
	if err != nil {
		return "[parse_error]"
	}
	changed := false
	for k := range values {
		if sensitiveParams[strings.ToLower(k)] {
			values.Set(k, "[REDACTED]")
			changed = true
		}
	}
	if !changed {
		return raw
	}
	return values.Encode()
}

func Logger() gin.HandlerFunc {
	return func(c *gin.Context) {
		start := time.Now()

		requestID := c.GetHeader("X-Request-ID")
		if requestID == "" {
			requestID = generateRequestID()
		}
		c.Set("request_id", requestID)
		c.Header("X-Request-ID", requestID)

		c.Next()

		latency := time.Since(start)
		statusCode := c.Writer.Status()

		var event *zerolog.Event
		if statusCode >= 500 {
			event = log.Error()
		} else if statusCode >= 400 {
			event = log.Warn()
		} else {
			event = log.Info()
		}

		userID, _ := c.Get("user_id")

		event.
			Str("request_id", requestID).
			Str("method", c.Request.Method).
			Str("path", c.Request.URL.Path).
			Str("query", redactQuery(c.Request.URL.RawQuery)).
			Int("status", statusCode).
			Int64("latency_ms", latency.Milliseconds()).
			Str("ip", c.ClientIP()).
			Str("user_agent", c.Request.UserAgent()).
			Interface("user_id", userID).
			Msg("request")
	}
}

func generateRequestID() string {
	return time.Now().Format("20060102150405") + randomString(6)
}

func randomString(n int) string {
	b := make([]byte, n)
	if _, err := rand.Read(b); err != nil {
		return time.Now().Format("150405")
	}
	return hex.EncodeToString(b)[:n]
}
