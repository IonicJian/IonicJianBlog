package content

import (
	"fmt"
	"image"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/zanelin/blog/internal/pkg/imageutil"
	resp "github.com/zanelin/blog/internal/pkg/response"
	contentS "github.com/zanelin/blog/internal/service/content"
)

type PhotoHandler struct {
	service contentS.PhotoService
}

func NewPhotoHandler(s contentS.PhotoService) *PhotoHandler {
	return &PhotoHandler{service: s}
}

func (h *PhotoHandler) List(c *gin.Context) {
	photos, err := h.service.List(c.Request.Context())
	if err != nil {
		resp.InternalError(c, err.Error())
		return
	}
	resp.Success(c, photos)
}

func (h *PhotoHandler) Create(c *gin.Context) {
	file, header, err := c.Request.FormFile("file")
	if err != nil {
		resp.BadRequest(c, "please select a photo file")
		return
	}
	defer file.Close()

	if err := imageutil.Validate(header.Filename, header.Size, 20*1024*1024); err != nil {
		resp.BadRequest(c, err.Error())
		return
	}

	img, _, err := image.Decode(file)
	if err != nil {
		resp.InternalError(c, "failed to decode image")
		return
	}

	filename := fmt.Sprintf("%s.jpg", uuid.New().String()[:12])
	url, err := imageutil.Save(img, imageutil.SaveOptions{
		Dir: "uploads/photos", Filename: filename, MaxWidth: 1920,
	})
	if err != nil {
		resp.InternalError(c, "failed to save photo")
		return
	}

	title := c.PostForm("title")
	sortOrder, _ := strconv.Atoi(c.PostForm("sort_order"))

	photo, err := h.service.Create(c.Request.Context(), url, title, sortOrder)
	if err != nil {
		resp.InternalError(c, err.Error())
		return
	}
	resp.Success(c, photo)
}

func (h *PhotoHandler) Delete(c *gin.Context) {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		resp.BadRequest(c, "invalid id")
		return
	}
	if err := h.service.Delete(c.Request.Context(), id); err != nil {
		resp.InternalError(c, err.Error())
		return
	}
	resp.Success(c, nil)
}
