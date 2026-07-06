package middleware

import (
	"net/http"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
	"golang.org/x/time/rate"
)

type visitor struct {
	limiter  *rate.Limiter
	lastSeen time.Time
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

	// Evict idle visitors periodically so the map doesn't grow unbounded.
	go rl.cleanup(3 * time.Minute)

	return func(c *gin.Context) {
		ip := c.ClientIP()

		rl.mu.Lock()
		v, exists := rl.visitors[ip]
		if !exists {
			v = &visitor{limiter: rate.NewLimiter(rl.rateVal, rl.burst)}
			rl.visitors[ip] = v
		}
		v.lastSeen = time.Now()
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

// cleanup periodically removes visitors not seen within the idle window.
func (rl *rateLimiter) cleanup(idle time.Duration) {
	ticker := time.NewTicker(time.Minute)
	defer ticker.Stop()
	for range ticker.C {
		rl.mu.Lock()
		now := time.Now()
		for ip, v := range rl.visitors {
			if now.Sub(v.lastSeen) > idle {
				delete(rl.visitors, ip)
			}
		}
		rl.mu.Unlock()
	}
}
