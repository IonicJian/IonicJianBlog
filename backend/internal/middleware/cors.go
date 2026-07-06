package middleware

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

func CORS(frontendURL string) gin.HandlerFunc {
	allowedOrigins := map[string]bool{frontendURL: true}
	if gin.Mode() != gin.ReleaseMode {
		allowedOrigins["http://localhost:5173"] = true
		allowedOrigins["http://localhost:3000"] = true
		allowedOrigins["http://127.0.0.1:5173"] = true
	}

	return func(c *gin.Context) {
		origin := c.Request.Header.Get("Origin")
		// Only echo the origin if it is on the allowlist. No wildcard (*) and no
		// credentials leak to unknown origins. Requests without an Origin header
		// (server-to-server, curl) get no CORS headers at all.
		if origin != "" && allowedOrigins[origin] {
			c.Header("Access-Control-Allow-Origin", origin)
			c.Header("Vary", "Origin")
			c.Header("Access-Control-Allow-Credentials", "true")
		}

		c.Header("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS")
		c.Header("Access-Control-Allow-Headers", "Origin, Content-Type, Accept, Authorization, X-Request-ID")
		c.Header("Access-Control-Expose-Headers", "X-Request-ID")
		c.Header("Access-Control-Max-Age", "86400")

		if c.Request.Method == http.MethodOptions {
			c.AbortWithStatus(http.StatusNoContent)
			return
		}

		c.Next()
	}
}
