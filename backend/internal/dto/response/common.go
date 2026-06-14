package response

// CommonResponse is a generic structure, but for most cases,
// use the response package's Response struct directly.
// This file serves as a reference for common patterns.

type LikeStatusResponse struct {
	Liked bool  `json:"liked"`
	Count int64 `json:"count"`
}
