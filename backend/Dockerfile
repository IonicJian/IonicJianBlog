# Dev stage — used by docker-compose.yml
FROM golang:1.26-alpine AS dev
RUN apk --no-cache add git
RUN go install github.com/air-verse/air@latest
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
CMD ["air", "-c", ".air.toml"]

# Build stage
FROM golang:1.26-alpine AS build
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-s -w" -o /server ./cmd/server

# Production stage
FROM alpine:3.21 AS prod
RUN apk --no-cache add ca-certificates tzdata curl
WORKDIR /app
COPY --from=build /server .
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
  CMD curl -sf http://localhost:8080/api/v1/health || exit 1
CMD ["./server"]
