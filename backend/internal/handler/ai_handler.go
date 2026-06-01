package handler

import (
	"github.com/gin-gonic/gin"
	resp "github.com/zanelin/blog/internal/pkg/response"
)

type AIHandler struct{}

func NewAIHandler() *AIHandler {
	return &AIHandler{}
}

func (h *AIHandler) GenerateSummary(c *gin.Context)  { resp.Success(c, nil) }
func (h *AIHandler) GetSummary(c *gin.Context)        { resp.Success(c, nil) }
func (h *AIHandler) GetGithubTrending(c *gin.Context) { resp.Success(c, nil) }
