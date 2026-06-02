package middleware

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

// MaxBodySize returns a middleware that limits the request body size to maxBytes.
// Requests with a Content-Length header that already exceeds the limit are
// rejected with 413 before the body is read. For requests without Content-Length
// (e.g. chunked transfer), http.MaxBytesReader ensures the body is not consumed
// beyond the limit, preventing memory exhaustion from oversized payloads.
func MaxBodySize(maxBytes int64) gin.HandlerFunc {
	return func(c *gin.Context) {
		if c.Request.ContentLength > maxBytes {
			c.AbortWithStatus(http.StatusRequestEntityTooLarge)
			return
		}
		c.Request.Body = http.MaxBytesReader(c.Writer, c.Request.Body, maxBytes)
		c.Next()
	}
}
