package blog

import (
	"fmt"
	"image"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/zanelin/blog/internal/pkg/imageutil"
	resp "github.com/zanelin/blog/internal/pkg/response"
)

// UploadImage handles blog image upload, resizes to max 1200px wide, saves as JPEG.
func UploadImage(c *gin.Context) {
	file, header, err := c.Request.FormFile("image")
	if err != nil { resp.BadRequest(c, "please select an image file"); return }
	defer file.Close()

	if err := imageutil.Validate(header.Filename, header.Size, 10*1024*1024); err != nil {
		resp.BadRequest(c, err.Error()); return
	}

	img, _, err := image.Decode(file)
	if err != nil { resp.InternalError(c, "failed to decode image"); return }

	filename := fmt.Sprintf("%s.jpg", uuid.New().String()[:12])
	url, err := imageutil.Save(img, imageutil.SaveOptions{
		Dir: "uploads/images", Filename: filename, MaxWidth: 1200,
	})
	if err != nil { resp.InternalError(c, "failed to save image"); return }
	resp.Success(c, gin.H{"url": url})
}
