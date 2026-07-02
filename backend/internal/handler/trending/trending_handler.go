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
	resp.Error(c, http.StatusNotImplemented, 501, "AI summary not yet implemented")
}

func (h *Handler) GetSummary(c *gin.Context) {
	resp.Error(c, http.StatusNotImplemented, 501, "AI summary not yet implemented")
}
