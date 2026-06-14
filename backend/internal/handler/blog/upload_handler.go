package blog

import (
	"fmt"
	"image"
	"image/jpeg"
	_ "image/gif"
	_ "image/png"
	_ "golang.org/x/image/webp"
	"os"
	"path/filepath"

	"github.com/disintegration/imaging"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	resp "github.com/zanelin/blog/internal/pkg/response"
)

// UploadImage handles blog image upload, resizes to max 1200px wide, saves as JPEG.
func UploadImage(c *gin.Context) {
	file, header, err := c.Request.FormFile("image")
	if err != nil { resp.BadRequest(c, "please select an image file"); return }
	defer file.Close()

	ext := filepath.Ext(header.Filename)
	allowed := map[string]bool{".jpg": true, ".jpeg": true, ".png": true, ".gif": true, ".webp": true}
	if !allowed[ext] { resp.BadRequest(c, "only jpg/png/gif/webp formats are supported"); return }
	if header.Size > 10*1024*1024 { resp.BadRequest(c, "image size must not exceed 10MB"); return }

	uploadDir := "uploads/images"
	if err := os.MkdirAll(uploadDir, 0755); err != nil { resp.InternalError(c, "failed to create upload directory"); return }

	img, _, err := image.Decode(file)
	if err != nil { resp.InternalError(c, "failed to decode image"); return }

	bounds := img.Bounds()
	if bounds.Dx() > 1200 { img = imaging.Resize(img, 1200, 0, imaging.Lanczos) }

	filename := fmt.Sprintf("%s.jpg", uuid.New().String()[:12])
	savePath := filepath.Join(uploadDir, filename)
	dst, err := os.Create(savePath)
	if err != nil { resp.InternalError(c, "failed to save file"); return }
	defer dst.Close()

	if err := jpeg.Encode(dst, img, &jpeg.Options{Quality: 85}); err != nil { resp.InternalError(c, "failed to encode image"); return }
	resp.Success(c, gin.H{"url": "/uploads/images/" + filename})
}
