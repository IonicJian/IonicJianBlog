package handler

import (
	"github.com/gin-gonic/gin"
	resp "github.com/zanelin/blog/internal/pkg/response"
	"github.com/zanelin/blog/internal/service"
)

type AIHandler struct {
	trendingService service.TrendingService
}

func NewAIHandler(trendingService service.TrendingService) *AIHandler {
	return &AIHandler{trendingService: trendingService}
}

func (h *AIHandler) GenerateSummary(c *gin.Context) {
	resp.Success(c, nil) // TODO: AI summary Phase 6
}

func (h *AIHandler) GetSummary(c *gin.Context) {
	resp.Success(c, nil) // TODO: AI summary Phase 6
}

func (h *AIHandler) GetGithubTrending(c *gin.Context) {
	repos := h.trendingService.GetTrending()
	resp.Success(c, repos)
}
