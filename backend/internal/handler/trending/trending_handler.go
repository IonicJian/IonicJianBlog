package trending

import (
	"net/http"

	"github.com/gin-gonic/gin"
	resp "github.com/zanelin/blog/internal/pkg/response"
	trendingSvc "github.com/zanelin/blog/internal/service/trending"
)

type Handler struct {
	service trendingSvc.Service
}

func New(s trendingSvc.Service) *Handler { return &Handler{service: s} }

func (h *Handler) GetGithubTrending(c *gin.Context) {
	repos := h.service.GetTrending()
	resp.Success(c, repos)
}

func (h *Handler) GenerateSummary(c *gin.Context) {
	c.JSON(http.StatusNotImplemented, gin.H{"code": 501, "message": "not implemented"})
}

func (h *Handler) GetSummary(c *gin.Context) {
	c.JSON(http.StatusNotImplemented, gin.H{"code": 501, "message": "not implemented"})
}
