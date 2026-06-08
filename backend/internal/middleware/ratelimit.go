package middleware

import (
	"net/http"
	"sync"

	"github.com/gin-gonic/gin"
	"golang.org/x/time/rate"
)

type visitor struct {
	limiter  *rate.Limiter
	lastSeen int64
}

type rateLimiter struct {
	mu       sync.Mutex
	visitors map[string]*visitor
	rateVal  rate.Limit
	burst    int
}

// RateLimit returns a middleware that limits requests per client IP.
// maxReqs is the burst size; ratePerSec controls the token refill rate.
// For example, RateLimit(10, 10.0/60.0) allows 10 requests per minute.
func RateLimit(maxReqs int, ratePerSec float64) gin.HandlerFunc {
	rl := &rateLimiter{
		visitors: make(map[string]*visitor),
		rateVal:  rate.Limit(ratePerSec),
		burst:    maxReqs,
	}

	return func(c *gin.Context) {
		ip := c.ClientIP()

		rl.mu.Lock()
		v, exists := rl.visitors[ip]
		if !exists {
			v = &visitor{limiter: rate.NewLimiter(rl.rateVal, rl.burst)}
			rl.visitors[ip] = v
		}
		rl.mu.Unlock()

		if !v.limiter.Allow() {
			c.AbortWithStatusJSON(http.StatusTooManyRequests, gin.H{
				"code":    429,
				"message": "rate limit exceeded, please try again later",
			})
			return
		}
		c.Next()
	}
}
