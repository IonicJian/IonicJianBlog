package jwt

import (
	"time"

	jwtlib "github.com/golang-jwt/jwt/v5"
)

type Claims struct {
	UserID   int64  `json:"user_id"`
	Username string `json:"username"`
	Role     string `json:"role"`
	jwtlib.RegisteredClaims
}

type TokenPair struct {
	AccessToken  string `json:"access_token"`
	RefreshToken string `json:"refresh_token"`
	ExpiresIn    int64  `json:"expires_in"`
}

func GenerateTokenPair(userID int64, username, role, secret string, accessExpiry, refreshExpiry time.Duration) (*TokenPair, error) {
	now := time.Now()

	accessClaims := &Claims{
		UserID:   userID,
		Username: username,
		Role:     role,
		RegisteredClaims: jwtlib.RegisteredClaims{
			ExpiresAt: jwtlib.NewNumericDate(now.Add(accessExpiry)),
			IssuedAt:  jwtlib.NewNumericDate(now),
			Subject:   "access",
		},
	}

	accessToken, err := jwtlib.NewWithClaims(jwtlib.SigningMethodHS256, accessClaims).SignedString([]byte(secret))
	if err != nil {
		return nil, err
	}

	refreshClaims := &Claims{
		UserID:   userID,
		Username: username,
		Role:     role,
		RegisteredClaims: jwtlib.RegisteredClaims{
			ExpiresAt: jwtlib.NewNumericDate(now.Add(refreshExpiry)),
			IssuedAt:  jwtlib.NewNumericDate(now),
			Subject:   "refresh",
		},
	}

	refreshToken, err := jwtlib.NewWithClaims(jwtlib.SigningMethodHS256, refreshClaims).SignedString([]byte(secret))
	if err != nil {
		return nil, err
	}

	return &TokenPair{
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
		ExpiresIn:    int64(accessExpiry.Seconds()),
	}, nil
}

func ValidateToken(tokenString, secret string) (*Claims, error) {
	token, err := jwtlib.ParseWithClaims(tokenString, &Claims{}, func(token *jwtlib.Token) (interface{}, error) {
		return []byte(secret), nil
	})
	if err != nil {
		return nil, err
	}

	claims, ok := token.Claims.(*Claims)
	if !ok || !token.Valid {
		return nil, jwtlib.ErrSignatureInvalid
	}

	return claims, nil
}
