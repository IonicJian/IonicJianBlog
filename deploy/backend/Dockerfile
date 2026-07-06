FROM alpine:3.21
RUN apk --no-cache add ca-certificates tzdata curl
RUN adduser -D -H -h /app appuser
WORKDIR /app
COPY blog-server .
RUN mkdir -p /app/uploads/images /app/uploads/avatars && chown -R appuser:appuser /app
USER appuser
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -sf http://localhost:8080/api/v1/health || exit 1
CMD ["./blog-server"]
