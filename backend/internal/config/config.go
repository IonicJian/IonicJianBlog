package config

import (
	"time"

	"github.com/spf13/viper"
)

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
	ClientID     string
	ClientSecret string
	RedirectURL  string
}

type AIConfig struct {
	Provider string
	APIKey   string
	Model    string
}

func Load() (*Config, error) {
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
			ClientID:     viper.GetString("GITHUB_CLIENT_ID"),
			ClientSecret: viper.GetString("GITHUB_CLIENT_SECRET"),
			RedirectURL:  viper.GetString("GITHUB_REDIRECT_URL"),
		},
		AI: AIConfig{
			Provider: viper.GetString("AI_PROVIDER"),
			APIKey:   viper.GetString("AI_API_KEY"),
			Model:    viper.GetString("AI_MODEL"),
		},
	}, nil
}
