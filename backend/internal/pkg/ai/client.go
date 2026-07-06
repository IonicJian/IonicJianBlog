package ai

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"

	"github.com/zanelin/blog/internal/config"
)

type Client struct {
	baseURL string
	apiKey  string
	model   string
	http    *http.Client
}

type Message struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

type Result struct {
	Text       string
	TokensUsed int
}

func New(cfg config.AIConfig) *Client {
	baseURL := cfg.BaseURL
	if baseURL == "" {
		baseURL = baseURLFor(cfg.Provider)
	}

	return &Client{
		baseURL: baseURL,
		apiKey:  cfg.APIKey,
		model:   cfg.Model,
		http:    &http.Client{Timeout: 60 * time.Second},
	}
}

func baseURLFor(provider string) string {
	switch provider {
	case "deepseek":
		return "https://api.deepseek.com/v1"
	case "openai":
		return "https://api.openai.com/v1"
	default:
		return "https://api.openai.com/v1"
	}
}

// Available reports whether the client has the minimum config to make calls.
func (c *Client) Available() bool {
	return c.apiKey != "" && c.model != ""
}

// ModelName returns the configured model identifier.
func (c *Client) ModelName() string {
	return c.model
}

// Complete sends a chat completion request and returns the generated text.
func (c *Client) Complete(ctx context.Context, messages []Message, maxTokens int) (*Result, error) {
	if !c.Available() {
		return nil, fmt.Errorf("AI client not configured")
	}

	reqBody := map[string]any{
		"model":       c.model,
		"messages":    messages,
		"temperature": 0.3,
	}
	if maxTokens > 0 {
		reqBody["max_tokens"] = maxTokens
	}

	bodyBytes, err := json.Marshal(reqBody)
	if err != nil {
		return nil, err
	}

	req, err := http.NewRequestWithContext(ctx, "POST", c.baseURL+"/chat/completions", bytes.NewReader(bodyBytes))
	if err != nil {
		return nil, err
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+c.apiKey)

	resp, err := c.http.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	respBytes, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("AI API status %d: %s", resp.StatusCode, string(respBytes))
	}

	var result struct {
		Choices []struct {
			Message struct {
				Content string `json:"content"`
			} `json:"message"`
		} `json:"choices"`
		Usage struct {
			TotalTokens int `json:"total_tokens"`
		} `json:"usage"`
	}
	if err := json.Unmarshal(respBytes, &result); err != nil {
		return nil, err
	}
	if len(result.Choices) == 0 {
		return nil, fmt.Errorf("AI API returned no choices")
	}

	return &Result{
		Text:       result.Choices[0].Message.Content,
		TokensUsed: result.Usage.TotalTokens,
	}, nil
}
