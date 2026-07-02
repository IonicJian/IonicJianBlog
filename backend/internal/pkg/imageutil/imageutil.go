// Package imageutil provides shared helpers for image upload handling:
// format validation, decode, resize, and JPEG re-encode to disk.
package imageutil

import (
	"errors"
	"image"
	"image/jpeg"
	_ "image/gif"
	_ "image/png"
	"os"
	"path/filepath"

	"github.com/disintegration/imaging"
	_ "golang.org/x/image/webp"
)

var allowedExts = map[string]bool{".jpg": true, ".jpeg": true, ".png": true, ".gif": true, ".webp": true}

// Validate checks file extension and size. Returns a user-facing error on reject.
func Validate(filename string, size, maxSize int64) error {
	ext := filepath.Ext(filename)
	if !allowedExts[ext] {
		return errors.New("only jpg/png/gif/webp formats are supported")
	}
	if size > maxSize {
		return errors.New("image size exceeds the allowed limit")
	}
	return nil
}

// SaveOptions controls how the image is processed before saving.
type SaveOptions struct {
	Dir      string // relative upload directory, e.g. "uploads/images"
	Filename string // final filename without directory
	MaxWidth int    // if > 0 and image is wider, resize preserving aspect ratio
	// Fill, when true, crops the image to exactly MaxWidth x MaxHeight (square/crop mode).
	Fill   bool
	Height int // used only when Fill is true
}

// Save decodes the image, applies the resize/crop, and writes JPEG quality 85.
// Returns the full URL path (e.g. "/uploads/images/abc.jpg").
func Save(src image.Image, opts SaveOptions) (url string, err error) {
	if err := os.MkdirAll(opts.Dir, 0755); err != nil {
		return "", err
	}

	processed := src
	if opts.Fill && opts.MaxWidth > 0 && opts.Height > 0 {
		processed = imaging.Fill(src, opts.MaxWidth, opts.Height, imaging.Center, imaging.Lanczos)
	} else if opts.MaxWidth > 0 && processed.Bounds().Dx() > opts.MaxWidth {
		processed = imaging.Resize(processed, opts.MaxWidth, 0, imaging.Lanczos)
	}

	savePath := filepath.Join(opts.Dir, opts.Filename)
	dst, err := os.Create(savePath)
	if err != nil {
		return "", err
	}
	defer dst.Close()

	if err := jpeg.Encode(dst, processed, &jpeg.Options{Quality: 85}); err != nil {
		return "", err
	}
	return "/" + opts.Dir + "/" + opts.Filename, nil
}
