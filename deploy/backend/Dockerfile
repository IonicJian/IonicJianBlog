FROM alpine:3.21
RUN apk --no-cache add ca-certificates tzdata curl
WORKDIR /app
COPY blog-server .
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -sf http://localhost:8080/api/v1/health || exit 1
CMD ["./blog-server"]
