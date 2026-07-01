package trending

import (
	"encoding/json"
	"net/http"
	"sync"
	"time"

	"github.com/rs/zerolog/log"
)

type TrendingRepo struct {
	Name        string `json:"name"`
	FullName    string `json:"full_name"`
	URL         string `json:"url"`
	Description string `json:"description"`
	Language    string `json:"language"`
	Stars       int    `json:"stars"`
	Forks       int    `json:"forks"`
	TodayStars  int    `json:"today_stars"`
}

type Service interface {
	GetTrending() []TrendingRepo
	Refresh()
}

type trendingService struct {
	mu     sync.RWMutex
	cache  []TrendingRepo
	client *http.Client
}

func New() Service {
	s := &trendingService{
		client: &http.Client{Timeout: 15 * time.Second},
	}
	s.Refresh()
	return s
}

func (s *trendingService) GetTrending() []TrendingRepo {
	s.mu.RLock()
	defer s.mu.RUnlock()
	if s.cache == nil {
		return []TrendingRepo{}
	}
	return s.cache
}

func (s *trendingService) Refresh() {
	repos, err := s.fetchTrending()
	if err != nil {
		log.Error().Err(err).Msg("failed to fetch github trending")
		return
	}
	s.mu.Lock()
	s.cache = repos
	s.mu.Unlock()
	log.Info().Int("count", len(repos)).Msg("github trending refreshed")
}

func (s *trendingService) fetchTrending() ([]TrendingRepo, error) {
	query := "created:>" +
		time.Now().AddDate(0, 0, -7).Format("2006-01-02") +
		"&sort=stars&order=desc&per_page=20"

	// Try GitHub API first, then mirrors (GFW workaround)
	urls := []string{
		"https://api.github.com/search/repositories?q=" + query,
		"https://api.gitmirror.com/search/repositories?q=" + query,
		"https://github-api.deno.dev/search/repositories?q=" + query,
	}

	var lastErr error
	for _, url := range urls {
		repos, err := s.tryFetch(url)
		if err == nil {
			return repos, nil
		}
		lastErr = err
	}
	return nil, lastErr
}

func (s *trendingService) tryFetch(url string) ([]TrendingRepo, error) {
	req, _ := http.NewRequest("GET", url, nil)
	req.Header.Set("Accept", "application/vnd.github.v3+json")
	req.Header.Set("User-Agent", "blog-trending")

	resp, err := s.client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	var result struct {
		Items []struct {
			Name        string `json:"name"`
			FullName    string `json:"full_name"`
			HTMLURL     string `json:"html_url"`
			Description string `json:"description"`
			Language    string `json:"language"`
			Stars       int    `json:"stargazers_count"`
			Forks       int    `json:"forks_count"`
		} `json:"items"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return nil, err
	}

	var repos []TrendingRepo
	for _, item := range result.Items {
		repos = append(repos, TrendingRepo{
			Name:        item.Name,
			FullName:    item.FullName,
			URL:         item.HTMLURL,
			Description: item.Description,
			Language:    item.Language,
			Stars:       item.Stars,
			Forks:       item.Forks,
		})
	}
	return repos, nil
}
