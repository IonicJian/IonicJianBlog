package config

import (
	"bufio"
	"os"
	"strings"
	"time"

	"github.com/spf13/viper"
)

func loadEnvFile(path string) {
	f, err := os.Open(path)
	if err != nil {
		return
	}
	defer f.Close()

	scanner := bufio.NewScanner(f)
	for scanner.Scan() {
		line := strings.TrimSpace(scanner.Text())
		if line == "" || strings.HasPrefix(line, "#") {
			continue
		}
		parts := strings.SplitN(line, "=", 2)
		if len(parts) != 2 {
			continue
		}
		key := strings.TrimSpace(parts[0])
		val := strings.TrimSpace(parts[1])
		if os.Getenv(key) == "" {
			os.Setenv(key, val)
		}
	}
}

type Config struct {
	Server   ServerConfig
	Database DatabaseConfig
	JWT      JWTConfig
	GitHub   GitHubOAuthConfig
	AI       AIConfig
}

type ServerConfig struct {
	Port        string
	Mode        string
	FrontendURL string
}

type DatabaseConfig struct {
	DSN string
}

type JWTConfig struct {
	Secret        string
	AccessExpiry  time.Duration
	RefreshExpiry time.Duration
}

type GitHubOAuthConfig struct {
	ClientID      string
	ClientSecret  string
	RedirectURL   string
	AdminGitHubID int64
}

type AIConfig struct {
	Provider string
	APIKey   string
	Model    string
}

func Load() (*Config, error) {
	loadEnvFile(".env")
	loadEnvFile("../.env")

	viper.AutomaticEnv()

	viper.SetDefault("SERVER_PORT", ":8080")
	viper.SetDefault("SERVER_MODE", "debug")
	viper.SetDefault("SERVER_FRONTEND_URL", "http://localhost:5173")
	viper.SetDefault("DATABASE_DSN", "postgres://blog_user:blog_password@localhost:5432/blog?sslmode=disable")
	viper.SetDefault("JWT_SECRET", "dev-secret-change-in-production")
	viper.SetDefault("JWT_ACCESS_EXPIRY", "15m")
	viper.SetDefault("JWT_REFRESH_EXPIRY", "168h")
	viper.SetDefault("AI_PROVIDER", "openai")
	viper.SetDefault("AI_MODEL", "gpt-4o-mini")

	accessExpiry, err := time.ParseDuration(viper.GetString("JWT_ACCESS_EXPIRY"))
	if err != nil {
		return nil, err
	}
	refreshExpiry, err := time.ParseDuration(viper.GetString("JWT_REFRESH_EXPIRY"))
	if err != nil {
		return nil, err
	}

	return &Config{
		Server: ServerConfig{
			Port:        viper.GetString("SERVER_PORT"),
			Mode:        viper.GetString("SERVER_MODE"),
			FrontendURL: viper.GetString("SERVER_FRONTEND_URL"),
		},
		Database: DatabaseConfig{
			DSN: viper.GetString("DATABASE_DSN"),
		},
		JWT: JWTConfig{
			Secret:        viper.GetString("JWT_SECRET"),
			AccessExpiry:  accessExpiry,
			RefreshExpiry: refreshExpiry,
		},
		GitHub: GitHubOAuthConfig{
			ClientID:      viper.GetString("GITHUB_CLIENT_ID"),
			ClientSecret:  viper.GetString("GITHUB_CLIENT_SECRET"),
			RedirectURL:   viper.GetString("GITHUB_REDIRECT_URL"),
			AdminGitHubID: viper.GetInt64("ADMIN_GITHUB_ID"),
		},
		AI: AIConfig{
			Provider: viper.GetString("AI_PROVIDER"),
			APIKey:   viper.GetString("AI_API_KEY"),
			Model:    viper.GetString("AI_MODEL"),
		},
	}, nil
}
