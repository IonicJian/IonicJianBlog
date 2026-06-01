package middleware

import (
	"net/http"
	"runtime/debug"

	"github.com/rs/zerolog/log"
	"github.com/gin-gonic/gin"
)

func Recovery() gin.HandlerFunc {
	return func(c *gin.Context) {
		defer func() {
			if err := recover(); err != nil {
				requestID, _ := c.Get("request_id")

				log.Error().
					Interface("request_id", requestID).
					Str("method", c.Request.Method).
					Str("path", c.Request.URL.Path).
					Interface("panic", err).
					Str("stack", string(debug.Stack())).
					Msg("panic recovered")

				c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{
					"code":    500,
					"message": "internal server error",
				})
			}
		}()
		c.Next()
	}
}
