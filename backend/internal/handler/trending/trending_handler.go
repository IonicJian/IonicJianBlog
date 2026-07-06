package trending

import (
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
