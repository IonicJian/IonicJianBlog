package trending

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"strings"
	"sync"
	"time"

	"github.com/rs/zerolog/log"
	"golang.org/x/net/html"

	"github.com/zanelin/blog/internal/pkg/ai"
)

type TrendingRepo struct {
	Name               string `json:"name"`
	FullName           string `json:"full_name"`
	URL                string `json:"url"`
	Description        string `json:"description"`
	Language           string `json:"language"`
	Stars              int    `json:"stars"`
	Forks              int    `json:"forks"`
	CurrentPeriodStars int    `json:"current_period_stars"`
	AICommentary       string `json:"ai_commentary,omitempty"`
}

type TrendingResult struct {
	Repos          []TrendingRepo `json:"repos"`
	OverallSummary string         `json:"overall_summary"`
}

type Service interface {
	GetTrending() TrendingResult
	Refresh()
}

type trendingService struct {
	mu             sync.RWMutex
	cache          []TrendingRepo
	overallSummary string
	client         *http.Client
	ai             *ai.Client
}

func New(aiClient *ai.Client) Service {
	s := &trendingService{
		client: &http.Client{Timeout: 15 * time.Second},
		ai:     aiClient,
	}
	s.Refresh()
	return s
}

func (s *trendingService) GetTrending() TrendingResult {
	s.mu.RLock()
	defer s.mu.RUnlock()
	repos := s.cache
	if repos == nil {
		repos = []TrendingRepo{}
	}
	return TrendingResult{
		Repos:          repos,
		OverallSummary: s.overallSummary,
	}
}

func (s *trendingService) Refresh() {
	repos, err := s.fetchTrending()
	if err != nil {
		log.Error().Err(err).Msg("failed to fetch github trending, keeping cached data")
		return
	}
	if len(repos) == 0 {
		log.Warn().Msg("github trending returned empty, keeping cached data")
		return
	}

	// Generate AI commentary concurrently (non-fatal on failure)
	s.generateCommentaries(repos)
	overall := s.generateOverallSummary(repos)

	s.mu.Lock()
	s.cache = repos
	s.overallSummary = overall
	s.mu.Unlock()
	log.Info().Int("count", len(repos)).Msg("github trending refreshed")
}

// generateCommentaries concurrently generates AI commentary for each repo.
// Each goroutine writes to its own slice index, so no locking is needed.
func (s *trendingService) generateCommentaries(repos []TrendingRepo) {
	if s.ai == nil || !s.ai.Available() {
		return
	}
	var wg sync.WaitGroup
	for i := range repos {
		wg.Add(1)
		go func(idx int) {
			defer wg.Done()
			repos[idx].AICommentary = s.commentRepo(repos[idx])
		}(i)
	}
	wg.Wait()
}

func (s *trendingService) commentRepo(repo TrendingRepo) string {
	input := fmt.Sprintf("仓库：%s\n描述：%s\n语言：%s\n星数：%d\n本周新增：%d",
		repo.FullName, repo.Description, repo.Language, repo.Stars, repo.CurrentPeriodStars)
	messages := []ai.Message{
		{Role: "system", Content: "你是 GitHub 项目解读助手。用2-3句话解读这个仓库：它做什么、为什么火。直接输出纯文本，不要前言、不要 markdown 符号。"},
		{Role: "user", Content: input},
	}
	result, err := s.ai.Complete(context.Background(), messages, 300)
	if err != nil {
		log.Debug().Err(err).Str("repo", repo.FullName).Msg("ai commentary failed")
		return ""
	}
	return strings.TrimSpace(result.Text)
}

func (s *trendingService) generateOverallSummary(repos []TrendingRepo) string {
	if s.ai == nil || !s.ai.Available() {
		return ""
	}
	var sb strings.Builder
	for _, r := range repos {
		sb.WriteString(fmt.Sprintf("- %s (%s): %s\n", r.FullName, r.Language, r.Description))
	}
	messages := []ai.Message{
		{Role: "system", Content: "你是 GitHub 趋势分析助手。根据本周 trending 仓库列表，总结当前技术趋势。按 2-3 个方面组织，每个方面单独一段，段落之间用空行分隔。用纯文本，不要 markdown 符号（如 **、#、- 等），不要前言。"},
		{Role: "user", Content: sb.String()},
	}
	result, err := s.ai.Complete(context.Background(), messages, 500)
	if err != nil {
		log.Debug().Err(err).Msg("ai overall summary failed")
		return ""
	}
	return strings.TrimSpace(result.Text)
}

func (s *trendingService) fetchTrending() ([]TrendingRepo, error) {
	// Primary: scrape github.com/trending page (SSR HTML)
	urls := []string{
		"https://github.com/trending?since=weekly",
		"https://gitmirror.com/trending?since=weekly",
	}

	var lastErr error
	for _, url := range urls {
		repos, err := s.scrapeTrending(url)
		if err == nil && len(repos) > 0 {
			return repos, nil
		}
		if err != nil {
			lastErr = err
		}
	}

	// Fallback: old Search API
	repos, err := s.fetchSearchAPI()
	if err == nil && len(repos) > 0 {
		log.Warn().Msg("using search API fallback for trending")
		return repos, nil
	}
	if err != nil {
		lastErr = err
	}

	return nil, lastErr
}

func (s *trendingService) scrapeTrending(url string) ([]TrendingRepo, error) {
	req, _ := http.NewRequest("GET", url, nil)
	req.Header.Set("User-Agent", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")
	req.Header.Set("Accept", "text/html,application/xhtml+xml")

	resp, err := s.client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != 200 {
		return nil, fmt.Errorf("unexpected status %d from %s", resp.StatusCode, url)
	}

	doc, err := html.Parse(resp.Body)
	if err != nil {
		return nil, err
	}

	var repos []TrendingRepo
	for _, article := range findArticles(doc) {
		repo := parseArticle(article)
		if repo != nil {
			repos = append(repos, *repo)
		}
	}
	return repos, nil
}

func findArticles(n *html.Node) []*html.Node {
	var articles []*html.Node
	var walk func(*html.Node)
	walk = func(node *html.Node) {
		if node.Type == html.ElementNode && node.Data == "article" {
			for _, attr := range node.Attr {
				if attr.Key == "class" && strings.Contains(attr.Val, "Box-row") {
					articles = append(articles, node)
					break
				}
			}
		}
		for c := node.FirstChild; c != nil; c = c.NextSibling {
			walk(c)
		}
	}
	walk(n)
	return articles
}

func parseArticle(article *html.Node) *TrendingRepo {
	var (
		fullName, description, language string
		stars, forks, periodStars       int
	)

	h2 := findByTagAndClass(article, "h2", "h3")
	if h2 != nil {
		a := findTag(h2, "a")
		if a != nil {
			text := textContent(a)
			parts := strings.SplitN(text, "/", 2)
			if len(parts) == 2 {
				fullName = strings.TrimSpace(parts[0]) + "/" + strings.TrimSpace(parts[1])
			}
		}
	}

	// Description: p.col-9
	descP := findByTagAndClass(article, "p", "col-9")
	if descP != nil {
		description = strings.TrimSpace(textContent(descP))
	}

	// Language: [itemprop=programmingLanguage]
	langSpan := findByAttr(article, "itemprop", "programmingLanguage")
	if langSpan != nil {
		language = strings.TrimSpace(textContent(langSpan))
	}

	// Stars and forks: a.Link--muted with /stargazers or /forks href
	for _, a := range findAllTag(article, "a") {
		if !hasClass(a, "Link--muted") {
			continue
		}
		href := attrVal(a, "href")
		text := strings.TrimSpace(textContent(a))
		text = strings.ReplaceAll(text, ",", "")
		if strings.Contains(href, "/stargazers") {
			if n, err := strconv.Atoi(text); err == nil {
				stars = n
			}
		}
		if strings.Contains(href, "/forks") {
			if n, err := strconv.Atoi(text); err == nil {
				forks = n
			}
		}
	}

	// Stars this week: span.float-sm-right
	periodSpan := findByTagAndClass(article, "span", "float-sm-right")
	if periodSpan != nil {
		periodText := strings.TrimSpace(textContent(periodSpan))
		parts := strings.Fields(periodText)
		if len(parts) > 0 {
			n, err := strconv.Atoi(strings.ReplaceAll(parts[0], ",", ""))
			if err == nil {
				periodStars = n
			}
		}
	}

	if fullName == "" {
		return nil
	}

	return &TrendingRepo{
		Name:               fullName[strings.Index(fullName, "/")+1:],
		FullName:           fullName,
		URL:                "https://github.com/" + fullName,
		Description:        description,
		Language:           language,
		Stars:              stars,
		Forks:              forks,
		CurrentPeriodStars: periodStars,
	}
}

// --- Search API fallback ---

func (s *trendingService) fetchSearchAPI() ([]TrendingRepo, error) {
	query := "created:>" +
		time.Now().AddDate(0, 0, -7).Format("2006-01-02") +
		"&sort=stars&order=desc&per_page=20"

	urls := []string{
		"https://api.github.com/search/repositories?q=" + query,
		"https://api.gitmirror.com/search/repositories?q=" + query,
	}

	var lastErr error
	for _, url := range urls {
		repos, err := s.trySearchAPI(url)
		if err == nil {
			return repos, nil
		}
		lastErr = err
	}
	return nil, lastErr
}

func (s *trendingService) trySearchAPI(url string) ([]TrendingRepo, error) {
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

// --- HTML helpers ---

func attrVal(n *html.Node, key string) string {
	for _, attr := range n.Attr {
		if attr.Key == key {
			return attr.Val
		}
	}
	return ""
}

func hasClass(n *html.Node, class string) bool {
	for _, attr := range n.Attr {
		if attr.Key == "class" {
			for _, c := range strings.Fields(attr.Val) {
				if c == class {
					return true
				}
			}
		}
	}
	return false
}

func textContent(n *html.Node) string {
	var buf strings.Builder
	var walk func(*html.Node)
	walk = func(node *html.Node) {
		if node.Type == html.TextNode {
			buf.WriteString(node.Data)
		}
		for c := node.FirstChild; c != nil; c = c.NextSibling {
			walk(c)
		}
	}
	walk(n)
	return buf.String()
}

func findTag(n *html.Node, tag string) *html.Node {
	if n.Type == html.ElementNode && n.Data == tag {
		return n
	}
	for c := n.FirstChild; c != nil; c = c.NextSibling {
		if found := findTag(c, tag); found != nil {
			return found
		}
	}
	return nil
}

func findAllTag(n *html.Node, tag string) []*html.Node {
	var result []*html.Node
	var walk func(*html.Node)
	walk = func(node *html.Node) {
		if node.Type == html.ElementNode && node.Data == tag {
			result = append(result, node)
		}
		for c := node.FirstChild; c != nil; c = c.NextSibling {
			walk(c)
		}
	}
	walk(n)
	return result
}

func findByTagAndClass(n *html.Node, tag, class string) *html.Node {
	var found *html.Node
	var walk func(*html.Node)
	walk = func(node *html.Node) {
		if found != nil {
			return
		}
		if node.Type == html.ElementNode && node.Data == tag && hasClass(node, class) {
			found = node
			return
		}
		for c := node.FirstChild; c != nil; c = c.NextSibling {
			walk(c)
		}
	}
	walk(n)
	return found
}

func findByAttr(n *html.Node, key, val string) *html.Node {
	var found *html.Node
	var walk func(*html.Node)
	walk = func(node *html.Node) {
		if found != nil {
			return
		}
		if node.Type == html.ElementNode {
			for _, attr := range node.Attr {
				if attr.Key == key && attr.Val == val {
					found = node
					return
				}
			}
		}
		for c := node.FirstChild; c != nil; c = c.NextSibling {
			walk(c)
		}
	}
	walk(n)
	return found
}
