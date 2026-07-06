export interface TrendingRepo {
  name: string
  full_name: string
  url: string
  description: string
  language: string
  stars: number
  forks: number
  current_period_stars: number
  ai_commentary?: string
}

export interface TrendingResult {
  repos: TrendingRepo[]
  overall_summary: string
}
